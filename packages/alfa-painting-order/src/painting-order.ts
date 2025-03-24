import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Selective } from "@siteimprove/alfa-selective";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Slice } from "@siteimprove/alfa-slice";
import { Style } from "@siteimprove/alfa-style";

import * as json from "@siteimprove/alfa-json";

const { and, not, or } = Refinement;
const {
  hasInitialComputedStyle,
  isBlockContainer,
  isFlexOrGridChild,
  isPositioned,
  isVisible,
} = Style;

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
  private readonly _order: Map<Element, number>;

  protected constructor(elements: Array<Element>) {
    this._elements = elements;
    this._order = Map.from(elements.map((element, index) => [element, index]));
  }

  public get elements(): Iterable<Element> {
    return this._elements;
  }

  public getOrderIndex(element: Element): Option<number> {
    return this._order.get(element);
  }

  public getElementsAbove(element: Element): Iterable<Element> {
    return this._order
      .get(element)
      .map((index) => Slice.of(this._elements, index + 1))
      .getOr([]);
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return (
      PaintingOrder.isPaintingOrder(value) &&
      Array.equals(value._elements, this._elements)
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
    root: Node,
    device: Device,
  ): PaintingOrder {
    return PaintingOrder.of(
      Selective.of(root)
        .if(Element.isElement, (element) => paint(device, element))
        .else((node) =>
          node
            .children(Node.fullTree)
            .filter(Element.isElement)
            .flatMap((element) => paint(device, element)),
        )
        .get(),
    );
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

  function sortAndSplitByZLevel(
    device: Device,
    elements: Iterable<Element>,
  ): [Array<Element>, Array<Element>] {
    const sorted = Array.from(
      Iterable.sortWith(elements, (a: Element, b: Element) =>
        Comparable.compare(getZLevel(device, a), getZLevel(device, b)),
      ),
    );

    const splitIndex = sorted.findIndex(
      (element) => getZLevel(device, element) >= 0,
    );

    if (splitIndex < 0) {
      return [sorted, []];
    }

    return [sorted.slice(0, splitIndex), sorted.slice(splitIndex)];
  }

  function paint(
    device: Device,
    element: Element,
    canvas: Sequence<Element> = Sequence.empty(),
    options: { defer: boolean } = {
      defer: false,
    },
  ): Sequence<Element> {
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
      if (createsStackingContext(device)(element)) {
        positionedOrStackingContexts.push(element);
      } else if (not(isPositioned(device, "static"))(element)) {
        if (hasInitialComputedStyle("z-index", device)(element)) {
          positionedOrStackingContexts.push(
            ...paint(device, element, Sequence.empty(), {
              defer: true,
            }),
          );
        } else {
          positionedOrStackingContexts.push(element);
        }
      } else if (not(hasInitialComputedStyle("float", device))(element)) {
        const temporaryLayer = paint(device, element, Sequence.empty(), {
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
        .filter(and(Element.isElement, isVisible(device)))) {
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

    const [negatives, nonNegatives] = sortAndSplitByZLevel(
      device,
      positionedOrStackingContexts,
    );

    canvas = paintLayer(device, canvas, negatives, element, options);
    canvas = paintLayer(device, canvas, blockLevels, element, options);
    canvas = paintLayer(device, canvas, floats, element, options);
    canvas = paintLayer(device, canvas, inlines, element, options);
    canvas = paintLayer(device, canvas, nonNegatives, element, options);

    return canvas;
  }

  /**
   * If the defer is true, painting of descendant stacking contexts should
   * be deferred i.e. the layer should just be concatenated to the (temporary) canvas.
   *
   * For some layers, the element that initiated the paint procedure,
   * might not have been painted yet and therefore might appear somewhere in one of the layers.
   * For that reason, to avoid going into infinite recursion, we need to check that each element in the layer is not the
   * parent and if it is, it should just be added to the canvas without recursing.
   */
  function paintLayer(
    device: Device,
    canvas: Sequence<Element>,
    layer: Array<Element>,
    parent: Element,
    options: { defer: boolean },
  ): Sequence<Element> {
    if (options.defer) {
      return canvas.concat(layer);
    }

    for (const element of layer) {
      if (element !== parent && createsStackingContext(device)(element)) {
        canvas = paint(device, element, canvas);
      } else {
        canvas = canvas.append(element);
      }
    }

    return canvas;
  }
}
