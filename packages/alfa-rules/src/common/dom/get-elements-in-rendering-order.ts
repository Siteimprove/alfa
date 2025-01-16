import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Keyword } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

const { and, not, or } = Refinement;
const {
  hasComputedStyle,
  hasInitialComputedStyle,
  isPositioned,
  isRendered: getIsRenderedPredicate,
} = Style;

const cache = Cache.empty<Device, Cache<Node, Sequence<Element>>>();

/**
 * Gets the descendant elements of a given element in rendering order.
 *
 * @public
 */
export function getElementsInRenderingOrder(
  root: Element,
  device: Device,
): Sequence<Element> {
  return cache
    .get(device, Cache.empty)
    .get(root, () => StackingContext.fromElement(root, device).descendants);
}

/**
 * @private
 */
class StackingContext {
  constructor(element: Element, children: Array<Element | StackingContext>) {
    this._element = element;
    this._children = children;
  }

  private readonly _element: Element;
  private readonly _children: Array<Element | StackingContext>;

  public get element() {
    return this._element;
  }

  public get children() {
    return Sequence.from(this._children);
  }

  public get descendants(): Sequence<Element> {
    return this.children.flatMap((child) => {
      if (Element.isElement(child)) {
        return Sequence.of(child);
      }

      return Sequence.of(
        child.element,
        Lazy.of(() => child.descendants),
      );
    });
  }
}

/**
 * @private
 */
namespace StackingContext {
  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context}
   */
  function getCreatesStackingContextPredicate(device: Device) {
    function hasZIndex(device: Device) {
      return not(hasInitialComputedStyle("z-index", device));
    }
    return or(
      // positioned with z-index:
      and(isPositioned(device, "absolute", "relative"), hasZIndex(device)),

      // fixed or sticky:
      isPositioned(device, "fixed", "sticky"),

      // TODO: January 2025: It seems chromium and firefox don't create stacking contexts for elements with container-type: size | inline-size.
      // Some sources seem to indicate that it is intentional and that the spec is wrong and will be updated, but I'm not sure if it's actually more complicated than that. Will have to investigate further.
      // https://dev.to/michaelcharles/chrome-129s-container-query-change-2i77
      // https://issues.chromium.org/issues/369781727
      //
      // hasComputedStyle(
      //   "container-type",
      //   ({ value }) => value === "size" || value === "inline-size",
      //   device,
      // ),

      // (flex | grid) child:
      and(hasZIndex(device), (element: Element) =>
        element
          .parent(Node.fullTree)
          .filter(Element.isElement)
          .some((parent) =>
            hasComputedStyle(
              "display",
              ({ values: [, inside] }) =>
                inside?.value === "flex" || inside?.value === "grid",
              device,
            )(parent),
          ),
      ),

      // opacity < 1:
      hasComputedStyle("opacity", ({ value: opacity }) => opacity < 1, device),

      // mix-blend-mode: !normal
      hasComputedStyle(
        "mix-blend-mode",
        ({ value }) => value !== "normal",
        device,
      ),

      // non-initial properties:
      not(hasInitialComputedStyle("transform", device)),
      not(hasInitialComputedStyle("scale", device)),
      not(hasInitialComputedStyle("rotate", device)),
      not(hasInitialComputedStyle("translate", device)),
      // not(hasInitialComputedStyle("filter", device)),  TODO: CSS property not implemented in Alfa
      // not(hasInitialComputedStyle("backdrop-filter", device)),  TODO: CSS property not implemented in Alfa
      not(hasInitialComputedStyle("perspective", device)),
      not(hasInitialComputedStyle("clip-path", device)),
      not(hasInitialComputedStyle("mask-clip", device)),
      not(hasInitialComputedStyle("mask-composite", device)),
      not(hasInitialComputedStyle("mask-mode", device)),
      not(hasInitialComputedStyle("mask-origin", device)),
      not(hasInitialComputedStyle("mask-position", device)),
      not(hasInitialComputedStyle("mask-repeat", device)),
      not(hasInitialComputedStyle("mask-size", device)),
      not(hasInitialComputedStyle("mask-image", device)),
      //not(hasInitialComputedStyle("mask-border", device)), TODO: CSS property not implemented in Alfa

      // isolation: isolate
      hasComputedStyle("isolation", ({ value }) => value === "isolate", device),

      // will-change: specifying any property that would create a stacking context on non-initial value
      // note: specifying the longhands for the shorthand `mask` does not create a stacking context in chromium
      hasComputedStyle(
        "will-change",
        (value) =>
          !Keyword.isKeyword(value) &&
          value.values.some(({ value }) =>
            [
              "position",
              "z-index",
              "opacity",
              "mix-blend-mode",
              "transform",
              "scale",
              "rotate",
              "translate",
              "filter",
              "backdrop-filter",
              "perspective",
              "clip-path",
              "mask",
              "isolation",
            ].includes(value),
          ),

        device,
      ),

      // contain: strict | content | layout | paint
      hasComputedStyle(
        "contain",
        (value) => {
          return Keyword.isKeyword(value)
            ? value.is("strict", "content")
            : value.layout || value.paint;
        },
        device,
      ),

      // TODO: top-layer - if the the element is placed on the top-layer. Do we want to suppor top-layer?

      // TODO: animation - if the element has had stacking context properties (such as opacity) animated using @keyframes,
      // with animation-fill-mode: forwards | both
    );
  }

  /**
   * Recursively builds a stacking context hierarchy from an element.
   * Stacking contexts are created from a DOM element by traversing it's element descendants
   * and adding every descendant that does not form a stacking contexts as a child in the parent stacking context.
   * We refer to process of adding the descendants that do not form stacking contexts as assimilating them into the parent stacking context.
   * When an element that does form a stacking contexts is encountered a new stacking context is recursively constructed.
   *
   * {@link https://www.w3.org/TR/CSS2/zindex.html}
   *
   * @public
   */
  export function fromElement(
    element: Element,
    device: Device,
  ): StackingContext {
    const isRendered = getIsRenderedPredicate(device);
    const createsStackingContext = getCreatesStackingContextPredicate(device);
    const isInline = hasComputedStyle(
      "display",
      ({ values: [outside] }) => outside.value === "inline",
      device,
    );
    const isFloat = hasComputedStyle(
      "float",
      ({ value }) => value !== "none",
      device,
    );
    const isStatic = isPositioned(device, "static");

    function compare(
      a: Element | StackingContext,
      b: Element | StackingContext,
    ) {
      function getStackLevel(element: Element) {
        // Setting a z-index on a non-positioned element has no effect
        if (isStatic(element)) {
          return 0;
        }

        const {
          value: { value: zIndex },
        } = Style.from(element, device).computed("z-index");

        return zIndex !== "auto" ? zIndex : 0;
      }

      /**
       * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_floating_elements}
       *
       * Without z-index, or when elements have the same stack level, they are rendered in the following priority:
       * 1. Non-positioned, non-floating elements
       * 2. Non-positioned, floating elements
       * 4. Floating, positioned elements
       * 5. Positioned elements
       */
      function getRenderingPriority(element: Element) {
        if (and(isStatic, not(isFloat))(element)) {
          return 1;
        }

        if (and(isStatic, isFloat)(element)) {
          return 2;
        }

        if (and(not(isStatic), isFloat)(element)) {
          return 4;
        }

        return 5;
      }

      function compare(a: Element, b: Element) {
        // First, compare z-indices
        const aZ = getStackLevel(a);
        const bZ = getStackLevel(b);
        if (aZ < bZ) {
          return Comparison.Less;
        }

        if (bZ < aZ) {
          return Comparison.Greater;
        }

        // Second, compare by rendering priority
        return Comparable.compare(
          getRenderingPriority(a),
          getRenderingPriority(b),
        );
      }

      return compare(
        Element.isElement(a) ? a : a.element,
        Element.isElement(b) ? b : b.element,
      );
    }

    function traverse(element: Element): Array<Element | StackingContext> {
      if (createsStackingContext(element)) {
        return [fromElement(element, device)];
      }

      const result: Array<Element | StackingContext> = [element];

      for (const child of element
        .children(Node.fullTree)
        .filter(and(Element.isElement, isRendered))) {
        result.push(...traverse(child));
      }

      return result;
    }

    const children: Array<Element | StackingContext> = [];
    for (const child of element
      .children(Node.fullTree)
      .filter(and(Element.isElement, isRendered))) {
      children.push(...traverse(child));
    }

    children.sort(compare);
    return new StackingContext(element, children);
  }
}
