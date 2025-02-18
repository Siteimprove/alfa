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
const {
  hasInitialComputedStyle,
  isBlockContainer,
  isFlexOrGridChild,
  isPositioned,
  isRendered,
} = Style;

import { Sequence } from "@siteimprove/alfa-sequence";
import { createsStackingContext } from "./predicate/creates-stacking-context.js";

/**
 * @public
 */
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

/**
 * @public
 */
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
  export const from = Cache.memoize(function (
    root: Element,
    device: Device,
  ): PaintingOrder {
    function paint(
      element: Element,
      canvas: Sequence<Element>,
      options: { defer?: boolean } = {
        defer: false,
      },
    ): Sequence<Element> {
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
        if (
          or(isFlexOrGridChild(device), createsStackingContext(device))(element)
        ) {
          positionedOrStackingContexts.push(element);
        } else if (not(isPositioned(device, "static"))(element)) {
          if (hasInitialComputedStyle("z-index", device)(element)) {
            positionedOrStackingContexts.push(
              ...paint(element, Sequence.empty(), {
                defer: true,
              }),
            );
          } else {
            positionedOrStackingContexts.push(element);
          }
        } else if (not(hasInitialComputedStyle("float", device))(element)) {
          const temporaryLayer = paint(element, Sequence.empty(), {
            defer: true,
          });

          for (const descendant of temporaryLayer) {
            if (
              or(
                not(isPositioned(device, "static")),
                createsStackingContext(device),
              )(descendant)
            ) {
              positionedOrStackingContexts.push(descendant);
            } else {
              floats.push(descendant);
            }
          }
        } else if (isBlockContainer(Style.from(element, device))) {
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
      if (isBlockContainer(Style.from(element, device))) {
        canvas = canvas.append(element);
      } else {
        inlines.push(element);
      }

      function traverse(element: Element) {
        for (const child of element
          .children(Node.fullTree)
          .filter(and(Element.isElement, isRendered(device)))) {
          distributeIntoLayers(child);

          if (
            or(
              not(isPositioned(device, "static")),
              not(hasInitialComputedStyle("float", device)),
              createsStackingContext(device),
            )(child)
          ) {
            // The child is going to be painted in full or partial isolation, so
            // we need to stop descending.
            continue;
          }

          traverse(child);
        }
      }
      traverse(element);

      positionedOrStackingContexts.sort((a: Element, b: Element) =>
        Comparable.compare(getZLevel(device, a), getZLevel(device, b)),
      );

      // If the defer is true, painting of descendant stacking contexts should
      // be deferred i.e. the element should just be added to the canvas, (which
      // should be a temporary canvas).
      let posDescIndex = 0;
      for (
        ;
        posDescIndex < positionedOrStackingContexts.length &&
        getZLevel(device, positionedOrStackingContexts[posDescIndex]) < 0;
        ++posDescIndex
      ) {
        const posOrSC = positionedOrStackingContexts[posDescIndex];
        if (!defer && posOrSC !== element) {
          canvas = paint(posOrSC, canvas);
        } else {
          canvas = canvas.append(posOrSC);
        }
      }

      for (const blockLevel of blockLevels) {
        if (!defer && createsStackingContext(device)(blockLevel)) {
          canvas = paint(blockLevel, canvas);
        } else {
          canvas = canvas.append(blockLevel);
        }
      }

      for (const float of floats) {
        if (
          !defer &&
          float !== element &&
          createsStackingContext(device)(float)
        ) {
          canvas = paint(float, canvas);
        } else {
          canvas = canvas.append(float);
        }
      }

      for (const inline of inlines) {
        if (
          !defer &&
          inline !== element &&
          createsStackingContext(device)(inline)
        ) {
          canvas = paint(inline, canvas);
        } else {
          canvas = canvas.append(inline);
        }
      }

      for (
        ;
        posDescIndex < positionedOrStackingContexts.length;
        ++posDescIndex
      ) {
        const posOrSC = positionedOrStackingContexts[posDescIndex];
        if (
          !defer &&
          posOrSC !== element &&
          createsStackingContext(device)(posOrSC)
        ) {
          canvas = paint(posOrSC, canvas);
        } else {
          canvas = canvas.append(posOrSC);
        }
      }

      return canvas;
    }

    return PaintingOrder.of(paint(root, Sequence.empty()));
  });

  function getZLevel(device: Device, element: Element) {
    // If the element is not positioned and not a flex child, setting a z-index
    // wont affect the z-level.
    if (
      and(
        isPositioned(device, "static"),
        not(isFlexOrGridChild(device)),
      )(element)
    ) {
      return 0;
    }

    const {
      value: { value },
    } = Style.from(element, device).computed("z-index");

    return value === "auto" ? 0 : value;
  }
}
