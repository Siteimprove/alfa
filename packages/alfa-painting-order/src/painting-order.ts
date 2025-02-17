import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

import * as json from "@siteimprove/alfa-json";

const { and, not, or } = Refinement;
const { hasComputedStyle, isRendered, isFlexOrGridChild } = Style;

import { createsStackingContext } from "./predicate/creates-stacking-context.js";

export class PaintingOrder
  implements Equatable, Hashable, Serializable<PaintingOrder.JSON>
{
  public static of(elements: Iterable<Element>): PaintingOrder {
    return new PaintingOrder(Array.from(elements));
  }

  private readonly _elements: Array<Element>;

  protected constructor(elements: Array<Element>) {
    this._elements = elements;
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return (
      value === this ||
      (PaintingOrder.isPaintingOrder(value) &&
        Array.equals(value._elements, this._elements))
    );
  }
  public hash(hash: Hash): void {
    Array.hash(this._elements, hash);
  }

  public toJSON(options?: Serializable.Options): PaintingOrder.JSON {
    return {
      type: "painting-order",
      elements: Array.toJSON(this._elements, options),
    };
  }
}

export namespace PaintingOrder {
  export type JSON = {
    [key: string]: json.JSON;
    type: "painting-order";
    elements: Array<Element.JSON>;
  };

  export function isPaintingOrder(value: unknown): value is PaintingOrder {
    return value instanceof PaintingOrder;
  }

  /**
   * Computes the painting order of the element descendants of a root element and
   * returns said elements in the order in which they would be painted onto the screen.
   *
   * {@link https://drafts.csswg.org/css2/#elaborate-stacking-contexts}
   *
   * @remarks
   * The painting order of flex children is different from the usual painting
   * order, but we currently do not observe these differences. The assumption is
   * that flex children, unless they are positioned or has z-index, should never
   * overlap, so it's acceptable that we do not get their relative order right as
   * long as the flex container itself is ordered correctly.
   * {@link https://www.w3.org/TR/css-flexbox-1/#painting}.
   *
   * @public
   */
  export const from = Cache.memoize(
    (root: Element, device: Device): PaintingOrder => {
      const isPositioned = hasComputedStyle(
        "position",
        (position) => position.value !== "static",
        device,
      );
      const hasAutoZIndex = hasComputedStyle(
        "z-index",
        ({ value }) => value === "auto",
        device,
      );
      const isBlockLevel = hasComputedStyle(
        "display",
        ({ values: [outside, inside, listItem] }) =>
          outside.value === "block" ||
          inside?.value === "table" ||
          inside?.value === "flex" ||
          inside?.value === "grid" ||
          listItem?.value === "list-item",
        device,
      );
      const isFloat = hasComputedStyle(
        "float",
        ({ value }) => value !== "none",
        device,
      );
      const createsSC = createsStackingContext(device);
      const rendered = isRendered(device);

      const getZLevel = (element: Element) => {
        // If the element is not positioned and not a flex child, setting a z-index
        // wont affect the z-level.
        if (and(not(isPositioned), not(isFlexOrGridChild(device)))(element)) {
          return 0;
        }

        const {
          value: { value },
        } = Style.from(element, device).computed("z-index");

        return value === "auto" ? 0 : value;
      };

      function paint(
        element: Element,
        canvas: Array<Element>,
        options: { defer?: boolean } = {
          defer: false,
        },
      ): void {
        const { defer = false } = options;
        const positionedOrStackingContexts: Array<Element> = [];
        const blockLevels: Array<Element> = [];
        const floats: Array<Element> = [];
        const inlines: Array<Element> = [];

        /**
         * @remarks
         * Positioned elements with z-index: auto and floating elements are treated
         * as if they create stacking contexts, but their positioned descendants
         * and descendants that create stacking contexts should be considered part
         * of the parent stacking context, i.e. we need to compute the painting
         * order of such subtrees, without recursing into positioned descendants
         * and descendants creating stacking contexts, then iterate the result and
         * distribute said descendants into layers at this level and add the float
         * itself and the other descendants to the floats layer.
         */
        function distributeIntoLayers(element: Element) {
          if (or(isFlexOrGridChild(device), createsSC)(element)) {
            positionedOrStackingContexts.push(element);
          } else if (isPositioned(element)) {
            if (hasAutoZIndex(element)) {
              const temporaryLayer: Array<Element> = [];
              paint(element, temporaryLayer, { defer: true });

              for (const descendant of temporaryLayer) {
                if (or(isPositioned, createsSC)(descendant)) {
                  if (or(isPositioned, createsSC)(descendant)) {
                    positionedOrStackingContexts.push(descendant);
                  } else if (isFloat(descendant)) {
                    floats.push(descendant);
                  } else if (isBlockLevel(descendant)) {
                    blockLevels.push(descendant);
                  } else {
                    inlines.push(descendant);
                  }
                } else {
                  positionedOrStackingContexts.push(descendant);
                }
              }
            } else {
              positionedOrStackingContexts.push(element);
            }
          } else if (isFloat(element)) {
            const temporaryLayer: Array<Element> = [];
            paint(element, temporaryLayer, { defer: true });

            for (const descendant of temporaryLayer) {
              if (or(isPositioned, createsSC)(descendant)) {
                positionedOrStackingContexts.push(descendant);
              } else {
                floats.push(descendant);
              }
            }
          } else if (isBlockLevel(element)) {
            blockLevels.push(element);
          } else {
            // everything else, this is somewhat crude and might not be accurate, but
            // will do for now.
            inlines.push(element);
          }
        }

        // Block-level elements, forming a stacking context, are painted before
        // their descendants. Inline-level elements, forming a stacking context,
        // are painted in the inline layer before its inline descendants
        // (and before stacking-context-creating and positioned descendants with
        // stack level greater than or equal to 0), but after positioned descendants
        // with negative z-index, block-level descendants and floating descendants.
        if (isBlockLevel(element)) {
          canvas.push(element);
        } else {
          inlines.push(element);
        }

        function traverse(element: Element) {
          for (const child of element
            .children(Node.fullTree)
            .filter(and(Element.isElement, rendered))) {
            distributeIntoLayers(child);

            if (or(isPositioned, isFloat, createsSC)(child)) {
              // The child is going to be painted in full or partial isolation, so
              // we need to stop descending.
              continue;
            }

            traverse(child);
          }
        }
        traverse(element);

        positionedOrStackingContexts.sort((a: Element, b: Element) =>
          Comparable.compare(getZLevel(a), getZLevel(b)),
        );

        // If the defer is true, painting of descendant stacking contexts should
        // be deferred i.e. the element should just be added to the canvas, (which
        // should be a temporary canvas).
        let posDescIndex = 0;
        for (
          ;
          posDescIndex < positionedOrStackingContexts.length &&
          getZLevel(positionedOrStackingContexts[posDescIndex]) < 0;
          ++posDescIndex
        ) {
          const posOrSC = positionedOrStackingContexts[posDescIndex];
          if (!defer && posOrSC !== element) {
            paint(posOrSC, canvas);
          } else {
            canvas.push(posOrSC);
          }
        }

        for (const blockLevel of blockLevels) {
          if (!defer && createsSC(blockLevel)) {
            paint(blockLevel, canvas);
          } else {
            canvas.push(blockLevel);
          }
        }

        for (const float of floats) {
          if (!defer && float !== element && createsSC(float)) {
            paint(float, canvas);
          } else {
            canvas.push(float);
          }
        }

        for (const inline of inlines) {
          if (!defer && inline !== element && createsSC(inline)) {
            paint(inline, canvas);
          } else {
            canvas.push(inline);
          }
        }

        for (
          ;
          posDescIndex < positionedOrStackingContexts.length;
          ++posDescIndex
        ) {
          const posOrSC = positionedOrStackingContexts[posDescIndex];
          if (!defer && posOrSC !== element && createsSC(posOrSC)) {
            paint(posOrSC, canvas);
          } else {
            canvas.push(posOrSC);
          }
        }
      }

      const canvas: Array<Element> = [];
      paint(root, canvas);

      return PaintingOrder.of(canvas);
    },
  );
}
