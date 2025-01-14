import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Trampoline } from "@siteimprove/alfa-trampoline";

const { and, not, or } = Refinement;
const {
  hasComputedStyle,
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

function hasZIndex(device: Device) {
  return hasComputedStyle(
    "z-index",
    ({ value: zIndex }) => zIndex !== "auto",
    device,
  );
}

/**
 * @private
 */
namespace StackingContext {
  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context}
   */
  function getCreatesStackingContextPredicate(device: Device) {
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

      // flex child:
      and(hasZIndex(device), (element: Element) =>
        element
          .parent(Node.fullTree)
          .filter(Element.isElement)
          .some((parent) =>
            hasComputedStyle(
              "display",
              ({ values: [, inside] }) => inside?.value === "flex",
              device,
            )(parent),
          ),
      ),
      // TODO: grid child

      // opacity < 1:
      hasComputedStyle("opacity", ({ value: opacity }) => opacity < 1, device),
      // TODO: mix-blend-mode
      // TODO: transform, scale, etc.
      // TODO: isolation
      // TODO: will-change
      // TODO: contain
      // TODO: top-layer ::backdrop
      // TODO: animation
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
    const isStatic = and(isPositioned(device, "static"), not(isFloat));

    function compare(
      a: Element | StackingContext,
      b: Element | StackingContext,
    ) {
      function getZIndex(element: Element) {
        // Setting a z-index on a non-positioned element has no effect
        if (isStatic(element)) {
          return 0;
        }

        const {
          value: { value: zIndex },
        } = Style.from(element, device).computed("z-index");

        return zIndex !== "auto" ? zIndex : 0;
      }

      function getRenderingPriority(element: Element) {
        // Order of elements:
        // 0. Static non-inline elements
        // 1. Floating elements
        // 2. Static inline elements
        // 3. Positoned elements
        if (and(isStatic, not(isInline))(element)) {
          return 0;
        } else if (isFloat(element)) {
          return 1;
        } else if (isStatic(element)) {
          return 2;
        } else if (not(isStatic)(element)) {
          return 3;
        }

        return Infinity;
      }

      function compare(a: Element, b: Element) {
        // First, compare z-indices
        const aZ = getZIndex(a);
        const bZ = getZIndex(b);
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

  // Unsuccessful attempt at using Trampoline to avoid recursion (and avoid potential risk of stack overflow).
  //
  // The attempt was unsuccessful because the algorithm uses two "interlocking" recursive functions and I could not find a way to either rewrite the algorithm
  // or have a two recursions with a trampoline.
  // It uses two recursions becuase to build the stacking context, we recursively traverse the DOM and when we encounter an element that creates a new stacking context,
  // we call the outer function recursively.
  export function fromElementWithTrampoline(
    element: Element,
    device: Device,
  ): Trampoline<StackingContext> {
    const isRendered = getIsRenderedPredicate(device);
    const createsStackingContext = getCreatesStackingContextPredicate(device);

    function traverse(
      element: Element,
    ): Trampoline<Array<Element | StackingContext>> {
      if (createsStackingContext(element)) {
        return Trampoline.done([
          fromElementWithTrampoline(element, device).run(),
        ]);
      }

      return Trampoline.traverse(
        element
          .children(Node.fullTree)
          .filter(and(Element.isElement, isRendered)),
        traverse,
      ).map((children) => Array.flatten(Array.from(children)));
    }

    return Trampoline.traverse(
      element
        .children(Node.fullTree)
        .filter(and(Element.isElement, isRendered)),
      traverse,
    ).map(
      (children) =>
        new StackingContext(element, Array.flatten(Array.from(children))),
    );
  }
}
