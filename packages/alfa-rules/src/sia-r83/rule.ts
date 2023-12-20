import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Cascade, RuleTree } from "@siteimprove/alfa-cascade";
import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  MediaRule,
  Namespace,
  Node,
  Rule as CSSRule,
  Text,
} from "@siteimprove/alfa-dom";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Media } from "@siteimprove/alfa-media";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope, Stability } from "../tags";

const { isHeight, isWidth } = Media.Feature;
const { Discrete, Range } = Media.Value;

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const {
  hasAttribute,
  hasBox,
  hasDisplaySize,
  hasName,
  hasNamespace,
  isElement,
} = Element;
const { isText } = Text;
const { getPositioningParent, hasCascadedStyle, isVisible } = Style;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://alfa.siteimprove.com/rules/sia-r83",
  requirements: [Criterion.of("1.4.4")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .inclusiveDescendants(
            Node.Traversal.of(
              Node.Traversal.composed,
              Node.Traversal.flattened,
            ),
          )
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
                  not(hasNamespace(Namespace.HTML)),
                  and(hasName("select"), hasDisplaySize(1)),
                ),
              ),
              node,
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
          for (const child of node.children(Node.fullTree)) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        const parent = target.parent(Node.fullTree).filter(isElement);

        const horizontallyClippedBy = parent.flatMap(
          horizontallyClipper(device),
        );

        const verticallyClippedBy = parent.flatMap(
          verticalClippingAncestor(device),
        );

        return {
          1: expectation(
            horizontallyClippedBy.isSome() || verticallyClippedBy.isSome(),
            () =>
              // If the clipping ancestor happens to be twice as big as the text
              // (parent), clipping only occurs after 200% zoom, which is OK.
              // We do not really care where is the text inside the clipping
              // ancestor, and simply assume that if it's big enough it will have
              // room to grow. This is not always true as the text may be pushed
              // to the far side already and ends up being clipped anyway.
              // This would only create false negatives, so this is OK.

              // There may be another further ancestor that is actually small and
              // clips both the text and the found clipping ancestors. We assume
              // this is not likely and just ignore it. This would only create
              // false negatives.
              horizontallyClippedBy.every(
                hasBox(
                  (clippingBox) =>
                    target
                      .parent()
                      .filter(isElement)
                      .some(
                        hasBox(
                          (targetBox) =>
                            clippingBox.width >= 2 * targetBox.width,
                          device,
                        ),
                      ),
                  device,
                ),
              ) &&
              verticallyClippedBy.every(
                hasBox(
                  (clippingBox) =>
                    target
                      .parent()
                      .filter(isElement)
                      .some(
                        hasBox(
                          (targetBox) =>
                            clippingBox.height >= 2 * targetBox.height,
                          device,
                        ),
                      ),
                  device,
                ),
              )
                ? Outcomes.IsContainer(
                    horizontallyClippedBy,
                    verticallyClippedBy,
                  )
                : Outcomes.ClipsText(
                    horizontallyClippedBy,
                    verticallyClippedBy,
                  ),
            () => Outcomes.WrapsText,
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
  device: Device,
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

      if (test(usesFontRelativeMediaRule(device, isHeight), element)) {
        // The element uses a (font relative) media rule, and we can't guess what
        // the page would like upon resizing and triggering a different media
        // query, so we just accept it as good enough
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
  device: Device,
): (element: Element) => Option<Element> {
  return (element) => {
    if (hasFontRelativeValue(device, "width")(element)) {
      // The element grows with its text.
      return None;
    }

    if (test(usesFontRelativeMediaRule(device, isWidth), element)) {
      // The element uses a (font relative) media rule, and we can't guess what
      // the page would like upon resizing and triggering a different media
      // query, so we just accept it as good enough
      return None;
    }

    switch (horizontalTextOverflow(element, device)) {
      case Overflow.Clip:
        return Option.of(element);
      case Overflow.Handle:
        return None;
      case Overflow.Overflow:
        return getPositioningParent(element, device).flatMap(
          horizontallyClippingAncestor(device),
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
  device: Device,
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

        if (test(usesFontRelativeMediaRule(device, isWidth), element)) {
          // The element uses a (font relative) media rule, and we can't guess what
          // the page would like upon resizing and triggering a different media
          // query, so we just accept it as good enough
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
              clippingAncestor,
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
  dimension: "x" | "y",
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

/**
 * Checks if an element has fixed (not font relative) height.
 *
 * @remarks
 * We use the cascaded value to avoid lengths being resolved to pixels.
 * Otherwise, we won't be able to tell if a font relative length was
 * used.
 *
 * @remarks
 * Calculated values cannot be resolved at cascade time. So we just accept them
 * (consider they are font relative) to avoid more false positives.
 *
 * @remarks
 * For heights set via the `style` attribute (the style has no parent),
 * we assume that its value is controlled by JavaScript and is adjusted
 * as the content scales.
 *
 */
function hasFixedHeight(device: Device): Predicate<Element> {
  return hasCascadedStyle(
    "height",
    (height, source) =>
      Length.isLength(height) &&
      !height.hasCalculation() &&
      height.value > 0 &&
      !height.isFontRelative() &&
      source.some((declaration) => declaration.parent.isSome()),
    device,
  );
}

/**
 * Checks if a style property has font relative or calculated value.
 *
 * @remarks
 * We use the cascaded value to avoid lengths being resolved to pixels.
 * Otherwise, we won't be able to tell if a font relative length was
 * used.
 *
 * @remarks
 * Calculated values cannot be resolved at cascad time. So we just accept them
 * (consider they are font relative) to avoid more false positives.
 */
function hasFontRelativeValue(
  device: Device,
  property: "height" | "width",
): Predicate<Element> {
  return or(
    hasCascadedStyle(
      property,
      (value) =>
        Length.isLength(value) &&
        (value.hasCalculation() || (value.value > 0 && value.isFontRelative())),
      device,
    ),
    hasCascadedStyle(
      `min-${property}`,
      (value) =>
        Length.isLength(value) &&
        (value.hasCalculation() || (value.value > 0 && value.isFontRelative())),
      device,
    ),
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
/*
 * We accept any property depending on a media query as handling the overflow,
 * not just the concerned properties (height, width, …) This is because the mere
 * presence of a media query suggests that there is an opposing one and we do
 * not know whether it changes the concerned properties or not. This only risks
 * creating false negatives.
 *
 * We only look at discrete media queries and minimum bound of ranges. Maximum
 * bounds will not trigger when text size increase, so they cannot control
 * overflow.
 */
const mediaRulesCache = Cache.empty<CSSRule, Sequence<MediaRule>>();

function ancestorMediaRules(rule: CSSRule): Sequence<MediaRule> {
  return mediaRulesCache.get(rule, () => {
    const mediaRules = rule.parent
      .map((parent) => ancestorMediaRules(parent))
      .getOrElse<Sequence<MediaRule>>(Sequence.empty);

    return MediaRule.isMediaRule(rule) ? mediaRules.prepend(rule) : mediaRules;
  });
}

const ruleTreeCache = Cache.empty<RuleTree.Node, Sequence<RuleTree.Node>>();

function ancestorsInRuleTree(rule: RuleTree.Node): Sequence<RuleTree.Node> {
  return ruleTreeCache.get(rule, () =>
    Sequence.from(rule.inclusiveAncestors()),
  );
}

function getUsedMediaRules(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
): Sequence<MediaRule> {
  const root = element.root();

  if (!Document.isDocument(root)) {
    return Sequence.empty();
  }

  // Get all nodes (style rules) in the RuleTree that affect the element;
  // for each of these rules, get all ancestor media rules in the CSS tree.
  return ancestorsInRuleTree(
    Cascade.from(root, device).get(element, context),
  ).flatMap((node) => ancestorMediaRules(node.block.rule));
}

function usesMediaRule(
  predicate: Predicate<MediaRule> = () => true,
  device: Device,
  context: Context = Context.empty(),
): Predicate<Element> {
  return (element) =>
    getUsedMediaRules(element, device, context).some(predicate);
}

/**
 * Checks whether at least one feature in one of the queries of the media rule
 * is a font-relative one. Only checks feature matching the refinement.
 *
 * @remarks
 * We currently do not support calculated media queries. But this is lost in the
 * typing of Media.Feature. Here, we simply consider them as "good" (font relative).
 */
function isFontRelativeMediaRule<F extends Media.Feature>(
  refinement: Refinement<Media.Feature, F>,
): Predicate<MediaRule> {
  return (rule) =>
    Iterable.some(rule.queries.queries, (query) =>
      query.condition.some((condition) =>
        Iterable.some(
          condition,
          (feature) =>
            refinement(feature) &&
            feature.value.some((value) =>
              Range.isRange(value)
                ? value.minimum.some(
                    (min) =>
                      Length.isLength(min.value) &&
                      (min.value.hasCalculation() ||
                        min.value.isFontRelative()),
                  )
                : Discrete.isDiscrete<Length>(value) &&
                  (value.value.hasCalculation() ||
                    value.value.isFontRelative()),
            ),
        ),
      ),
    );
}

function usesFontRelativeMediaRule<F extends Media.Feature>(
  device: Device,
  refinement: Refinement<Media.Feature, F>,
  context: Context = Context.empty(),
): Predicate<Element> {
  return usesMediaRule(isFontRelativeMediaRule(refinement), device, context);
}

/**
 * @public
 */
export class ClippingAncestors extends Diagnostic {
  public static of(
    message: string,
    horizontal: Option<Element> = None,
    vertical: Option<Element> = None,
  ): ClippingAncestors {
    return new ClippingAncestors(message, horizontal, vertical);
  }

  private readonly _horizontal: Option<Element>;
  private readonly _vertical: Option<Element>;

  private constructor(
    message: string,
    horizontal: Option<Element>,
    vertical: Option<Element>,
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

  public hash(hash: Hash) {
    super.hash(hash);
    this._vertical.hash(hash);
    this._horizontal.hash(hash);
  }

  public toJSON(): ClippingAncestors.JSON {
    return {
      ...super.toJSON(),
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace ClippingAncestors {
  export interface JSON extends Diagnostic.JSON {
    horizontal: Option.JSON<Element>;
    vertical: Option.JSON<Element>;
  }

  export function isClippingAncestors(
    value: Diagnostic,
  ): value is ClippingAncestors;

  export function isClippingAncestors(
    value: unknown,
  ): value is ClippingAncestors;

  /**@public */
  export function isClippingAncestors(
    value: unknown,
  ): value is ClippingAncestors {
    return value instanceof ClippingAncestors;
  }
}

/**
 * @public
 */
export namespace Outcomes {
  export const WrapsText = Ok.of(
    ClippingAncestors.of(`The text is wrapped without being clipped`),
  );

  export const ClipsText = (
    horizontal: Option<Element>,
    vertical: Option<Element>,
  ) =>
    Err.of(ClippingAncestors.of(`The text is clipped`, horizontal, vertical));

  export const IsContainer = (
    horizontal: Option<Element>,
    vertical: Option<Element>,
  ) =>
    Ok.of(
      ClippingAncestors.of(
        "The text would be clipped but the clipper is more than twice as large",
        horizontal,
        vertical,
      ),
    );
}
