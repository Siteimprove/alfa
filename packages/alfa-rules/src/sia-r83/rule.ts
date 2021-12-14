import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute, hasCascadedStyle, isVisible } from "../common/predicate";

import { getPositioningParent } from "../common/expectation/get-positioning-parent";
import { Scope } from "../tags";

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { isElement, hasName, hasNamespace } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://alfa.siteimprove.com/rules/sia-r83",
  requirements: [Criterion.of("1.4.4")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .inclusiveDescendants({ composed: true, flattened: true })
          .find(and(isElement, hasName("body")))
          .map((body) => body.children())
          .getOr(Sequence.empty())
          .flatMap((node) => Sequence.from(visit(node)));

        function* visit(node: Node, collect: boolean = false): Iterable<Text> {
          // aria-hidden content is ignored by the rule.
          if (
            test(
              and(
                isElement,
                or(
                  hasAttribute("aria-hidden", equals("true")),
                  not(hasNamespace(Namespace.HTML))
                )
              ),
              node
            )
          ) {
            return;
          }

          // If a potentially clipping ancestor is found, start collecting.
          if (
            isElement(node) &&
            (overflow(node, device, "x") === Overflow.Clip ||
              overflow(node, device, "y") === Overflow.Clip)
          ) {
            collect = true;
          }

          // If we are collecting and a visible text node is found, yield it.
          if (collect && test(and(isText, isVisible(device)), node)) {
            yield node;
          }

          // Recursively visit subtree.
          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        const parent = target
          .parent({ flattened: true, nested: true })
          .filter(isElement);

        const horizontallyClippedBy = parent.flatMap(
          horizontallyClipper(device)
        );

        const verticallyClippedBy = parent.flatMap(
          verticalClippingAncestor(device)
        );

        return {
          1: expectation(
            horizontallyClippedBy.isSome() || verticallyClippedBy.isSome(),
            () =>
              Outcomes.ClipsText(horizontallyClippedBy, verticallyClippedBy),
            () => Outcomes.WrapsText
          ),
        };
      },
    };
  },
});

const verticallyClippingCache = Cache.empty<
  Device,
  Cache<Element, Option<Element>>
>();
/**
 * Checks if an element clips its vertical overflow by having an ancestor with
 * both a fixed height and a clipping overflow (before any scrolling ancestor).
 *
 * Note that element with a fixed height will create an overflow anyway, and
 * that may be clipped by any other ancestor. However, there may also be several
 * elements below that can absorb the vertical overflow. So we only report
 * when the same element has fixed height and clips.
 */
function verticalClippingAncestor(
  device: Device
): (element: Element) => Option<Element> {
  return function clippingAncestor(element: Element): Option<Element> {
    return verticallyClippingCache.get(device, Cache.empty).get(element, () => {
      if (hasFontRelativeValue(device, "height")(element)) {
        // The element has a font-relative height or min-height and we assume
        // it will properly grow with the font, without ever clipping it.
        // This is not fully correct since an ancestor may still clip vertically,
        // but there may be several elements in between to absorb the growth.
        return None;
      }

      if (
        hasFixedHeight(device)(element) &&
        overflow(element, device, "y") === Overflow.Clip
      ) {
        return Option.of(element);
      }

      if (overflow(element, device, "y") === Overflow.Handle) {
        return None;
      }

      return getPositioningParent(element, device).flatMap(clippingAncestor);
    });
  };
}

/**
 * Checks if an element ultimately clips its horizontal overflow:
 * * all elements are assumed to have fixed width because the page cannot extend
 *   infinitely in the horizontal dimension;
 * * first we look at the element itself and how it handles the text overflow of
 *   its children text nodes;
 * * if text overflows its parent, it does so as content, so we look for an
 *   ancestor that either handles it (scroll bar) or clips it.
 */
function horizontallyClipper(
  device: Device
): (element: Element) => Option<Element> {
  return (element) => {
    if (hasFontRelativeValue(device, "width")(element)) {
      // The element grows with its text.
      return None;
    }

    switch (horizontalTextOverflow(element, device)) {
      case Overflow.Clip:
        return Option.of(element);
      case Overflow.Handle:
        return None;
      case Overflow.Overflow:
        return getPositioningParent(element, device).flatMap(
          horizontallyClippingAncestor(device)
        );
    }
  };
}

const horizontallyClippingCache = Cache.empty<
  Device,
  Cache<Element, Option<Element>>
>();
/**
 * Checks whether the first offset ancestor that doesn't overflow is
 * clipping.
 *
 * When encountering an ancestor which is a wrapping flex container, we assume
 * that this ancestor is correctly wrapping all its children and that no
 * individual child overflows enough to overflow the parent (when alone on a
 * line). This is not fully correct (since an individual child might overflow
 * enough that it would overflow the flex-wrapping ancestor even if alone on a
 * line); but this seems to be a frequent use case.
 */
function horizontallyClippingAncestor(
  device: Device
): (element: Element) => Option<Element> {
  return function clippingAncestor(element: Element): Option<Element> {
    return horizontallyClippingCache
      .get(device, Cache.empty)
      .get(element, () => {
        if (hasFontRelativeValue(device, "width")(element)) {
          // The element grows with its content.
          // The content might still be clipped by an ancestor, but we
          // assume this denotes a small component inside a large container
          // with enough room for the component to grow to 200% or more
          // before being clipped.
          return None;
        }

        if (isWrappingFlexContainer(device)(element)) {
          // The element handles overflow by wrapping its flex descendants
          return None;
        }
        switch (overflow(element, device, "x")) {
          case Overflow.Clip:
            return Option.of(element);
          case Overflow.Handle:
            return None;
          case Overflow.Overflow:
            return getPositioningParent(element, device).flatMap(
              clippingAncestor
            );
        }
      });
  };
}

enum Overflow {
  Clip, // The element clips its overflow.
  Handle, // The element definitely handles its overflow.
  Overflow, // The element overflows into its parent.
}

function overflow(
  element: Element,
  device: Device,
  dimension: "x" | "y"
): Overflow {
  switch (
    Style.from(element, device).computed(`overflow-${dimension}`).value.value
  ) {
    case "clip":
    case "hidden":
      return Overflow.Clip;
    case "scroll":
    case "auto":
      return Overflow.Handle;
    case "visible":
      return Overflow.Overflow;
  }
}

/**
 * Checks how an element handle its text overflow (overflow of its children
 * text nodes).
 */
function horizontalTextOverflow(element: Element, device: Device): Overflow {
  const style = Style.from(element, device);

  const { value: whitespace } = style.computed("white-space");

  if (whitespace.value !== "nowrap" && whitespace.value !== "pre") {
    // Whitespace causes wrapping, the element doesn't overflow its text.
    return Overflow.Handle;
  }
  // If whitespace does not cause wrapping, we need to check if a text
  // overflow occurs and could cause the text to clip.
  switch (overflow(element, device, "x")) {
    case Overflow.Overflow:
      // The text always overflow into the parent, parent needs to handle an
      // horizontal content overflow
      return Overflow.Overflow;
    case Overflow.Handle:
      // The element handles its text overflow with a scroll bar
      return Overflow.Handle;
    case Overflow.Clip:
      // The element clip its overflow, but maybe `text-overflow` handles it.
      const { value: overflow } = style.computed("text-overflow");
      // We assume that anything other than `clip` handles the overflow.
      return overflow.value === "clip" ? Overflow.Clip : Overflow.Handle;
  }
}

function hasFixedHeight(device: Device): Predicate<Element> {
  // Use the cascaded value to avoid lengths being resolved to pixels.
  // Otherwise, we won't be able to tell if a font relative length was
  // used.
  return hasCascadedStyle(
    "height",
    (height, source) =>
      height.type === "length" &&
      height.value > 0 &&
      // !height.isFontRelative() &&
      // For heights set via the `style` attribute we assume that its value is
      // controlled by JavaScript and is adjusted as the content scales.
      source.some((declaration) => declaration.parent.isSome()),
    device
  );
}

//isClipped-doesn't-consider-offset-parents

function hasFontRelativeValue(
  device: Device,
  property: "height" | "width"
): Predicate<Element> {
  // Use the cascaded value to avoid lengths being resolved to pixels.
  // Otherwise, we won't be able to tell if a font relative length was
  // used.
  return or(
    hasCascadedStyle(
      property,
      (value) =>
        value.type === "length" && value.value > 0 && value.isFontRelative(),
      device
    ),
    hasCascadedStyle(
      `min-${property}`,
      (value) =>
        value.type === "length" && value.value > 0 && value.isFontRelative(),
      device
    )
  );
}

function isWrappingFlexContainer(device: Device): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device);
    const {
      value: { values: display },
    } = style.computed("display");

    if (display[1]?.value === "flex") {
      // The element is a flex container
      const { value: flexWrap } = style.computed("flex-wrap");
      return flexWrap.value !== "nowrap";
    }

    return false;
  };
}

export class ClippingAncestors extends Diagnostic {
  public static of(
    message: string,
    horizontal: Option<Element> = None,
    vertical: Option<Element> = None
  ): ClippingAncestors {
    return new ClippingAncestors(message, horizontal, vertical);
  }

  private readonly _horizontal: Option<Element>;
  private readonly _vertical: Option<Element>;

  private constructor(
    message: string,
    horizontal: Option<Element>,
    vertical: Option<Element>
  ) {
    super(message);
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get horizontal(): Option<Element> {
    return this._horizontal;
  }

  public get vertical(): Option<Element> {
    return this._vertical;
  }

  public equals(value: ClippingAncestors): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      super.equals(value) &&
      value instanceof ClippingAncestors &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical)
    );
  }

  public toJSON(): ClippingAncestors.JSON {
    return {
      ...super.toJSON(),
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }
}

export namespace ClippingAncestors {
  export interface JSON extends Diagnostic.JSON {
    horizontal: Option.JSON<Element>;
    vertical: Option.JSON<Element>;
  }
}

export namespace Outcomes {
  export const WrapsText = Ok.of(
    ClippingAncestors.of(`The text is wrapped without being clipped`)
  );

  export const ClipsText = (
    horizontal: Option<Element>,
    vertical: Option<Element>
  ) =>
    Err.of(ClippingAncestors.of(`The text is clipped`, horizontal, vertical));
}
