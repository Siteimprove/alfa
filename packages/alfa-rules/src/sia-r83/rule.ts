import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import type { RuleTree } from "@siteimprove/alfa-cascade";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Length } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import type { Device } from "@siteimprove/alfa-device";
import type { Rule as CSSRule } from "@siteimprove/alfa-dom";
import {
  Document,
  Element,
  MediaRule,
  Namespace,
  Node,
  Query,
  Text,
} from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { isHeight, isWidth } = Feature.Media.Feature;
const { Discrete, Range } = Feature.Media.Value;

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { hasAttribute, hasName, hasNamespace, isElement } = Element;
const { hasBox } = Node;
const { isText } = Text;
const {
  getPositioningParent,
  hasCascadedStyle,
  hasComputedStyle,
  hasUsedStyle,
  isVisible,
} = Style;

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
        const horizontallyClippedBy = ClippingAncestor.horizontal(
          device,
          target,
        );

        const verticallyClippedBy = ClippingAncestor.vertical(device, target);

        const hasBig = isTwiceAsBig(target, device);

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
              expectation(
                horizontallyClippedBy.every(hasBig("width")) &&
                  verticallyClippedBy.every(hasBig("height")),
                () =>
                  Outcomes.IsContainer(
                    horizontallyClippedBy,
                    verticallyClippedBy,
                  ),
                () =>
                  Outcomes.ClipsText(
                    horizontallyClippedBy,
                    verticallyClippedBy,
                  ),
              ),
            () => Outcomes.WrapsText,
          ),
        };
      },
    };
  },
});

enum Overflow {
  Clip = "Clip", // The element clips its overflow.
  Handle = "Handle", // The element definitely handles its overflow.
  Overflow = "Overflow", // The element overflows into its parent.
}

function overflow(
  element: Element,
  device: Device,
  dimension: "x" | "y",
): Overflow {
  return Style.from(element, device)
    .used(`overflow-${dimension}`)
    .map((overflow) => {
      switch (overflow.value.value) {
        case "clip":
        case "hidden":
          return Overflow.Clip;
        case "scroll":
        case "auto":
          return Overflow.Handle;
        case "visible":
          return Overflow.Overflow;
      }
    })
    .getOr(Overflow.Overflow);
}

/**
 * Return the box of a text, or its parent element.
 */
function textBox(text: Text, device: Device): Option<Rectangle> {
  return text.getBoundingBox(device).orElse(() =>
    text
      .parent(Node.fullTree)
      .filter(isElement)
      .flatMap((parent) => parent.getBoundingBox(device)),
  );
}

/**
 * Return the convex hull of all the text boxes in a line.
 *
 * @remarks
 * This essentially considers that the line cannot wrap, which is correct in our
 * use case since we only call that when we have clipping ancestors. If the line
 * wraps, this will still return the correct box (because each individual box is
 * already in its post-wrapping position), but the validity for using it in our
 * case becomes a bit dubious.
 */
function lineBox(text: Text, device: Device): Rectangle {
  return Rectangle.union(
    ...text
      .ancestors(Node.fullTree)
      .find(
        and(isElement, (element) =>
          Style.isBlockContainer(Style.from(element, device)),
        ),
      )
      .map((blockAncestor) =>
        Query.getDescendants(isText)(blockAncestor, Node.fullTree),
      )
      .getOrElse(Sequence.empty)
      .collect((text) => textBox(text, device)),
  );
}

/**
 * Create a predicate (generator), testing if a container is twice as big as
 * the target text; uses the text layout if present, else its parent layout.
 */
function isTwiceAsBig(
  target: Text,
  device: Device,
): (dimension: "width" | "height") => Predicate<Element> {
  return (dimension) =>
    hasBox(
      (clippingBox) =>
        clippingBox[dimension] >= 2 * lineBox(target, device)[dimension],
      device,
    );
}

namespace ClippingAncestor {
  export const vertical = clipper("height", localVerticalOverflow);
  // This is eta-expanded to avoid premature evaluation of the localHorizontalOverflow function.
  export const horizontal = (device: Device, text: Text) =>
    clipper("width", localHorizontalOverflow())(device, text);

  const predicates = { height: isHeight, width: isWidth };
  const clipperCaches = {
    height: Cache.empty<Device, Cache<Element, Option<Element>>>(),
    width: Cache.empty<Device, Cache<Element, Option<Element>>>(),
  };

  function clipper(
    dimension: "height" | "width",
    localOverflow: (device: Device, text: Text, parent: Element) => Overflow,
  ): (device: Device, text: Text) => Option<Element> {
    return (device, text) => {
      function clipper(element: Element): Option<Element> {
        return clipperCaches[dimension]
          .get(device, Cache.empty)
          .get(element, () => {
            if (hasFontRelativeValue(device, dimension)(element)) {
              // The element has a font-relative [dimension] or min-[dimension]
              // and we assume it will properly grow with the font, without ever
              // clipping it. This is not fully correct since an ancestor may
              // still clip, but there may be several elements in between to
              // absorb the growth.
              return None;
            }

            if (
              test(
                Media.usesFontRelativeMediaRule(device, predicates[dimension]),
                element,
              )
            ) {
              // The element uses a (font relative) media rule, and we can't guess
              // what the page would like upon resizing and triggering a different
              // media query, so we just accept it as good enough
              return None;
            }

            switch (localOverflow(device, text, element)) {
              case Overflow.Clip:
                // The element definitely clips, we've found our clipper.
                return Option.of(element);
              case Overflow.Handle:
                // The element definitely handles, nothing to report.
                return None;
              case Overflow.Overflow:
                // The element overflows, need to recurse into ancestors.
                return getPositioningParent(element, device).flatMap(clipper);
            }
          });
      }

      return text.parent(Node.fullTree).filter(isElement).flatMap(clipper);
    };
  }

  /**
   * Finds how the text manages its vertical overflow within the context of
   * an ancestor element.
   */
  function localVerticalOverflow(
    device: Device,
    text: Text,
    ancestor: Element,
  ): Overflow {
    const verticalOverflow = overflow(ancestor, device, "y");
    switch (verticalOverflow) {
      case Overflow.Clip:
        return constrainingAncestor(ancestor, device, "height").every(
          isTwiceAsBig(text, device)("height"),
        )
          ? // If there is no constraining ancestor, or it is big enough, then
            // the text can overflow.
            // We return a somewhat incorrect value here as it will ultimately
            // turn into an Outcome.WrapsText while a Outcome.IsContainer would
            // be more correct when there is a constraining ancestor. This is
            // OK since we do not really rely on that information anywhere.
            Overflow.Overflow
          : Overflow.Clip;
      default:
        return verticalOverflow;
    }
  }

  /**
   * Finds how the text manages its horizontal overflow within the context of
   * an ancestor element.
   *
   * @remarks
   * We need both the text and the ancestor to check because the text may
   * overflow through many ancestors before finding a clipping one, at which
   * point we need to compare the width of the text and the clipper.
   *
   * We re-create a function on each call, so it can internally store whether
   * that run has escaped its block container or not. `text-overflow` only
   * takes effect on the first ancestor block container.
   */
  function localHorizontalOverflow(): (
    device: Device,
    text: Text,
    ancestor: Element,
  ) => Overflow {
    // While we are in the same block as the text:
    // * text can break at soft wrap points (whitespace).
    // * text-overflow can handle the overflow.
    let inSameBlock = true;

    return (device, text, ancestor) => {
      const style = Style.from(ancestor, device);

      if (
        inSameBlock &&
        test(
          and(
            hasComputedStyle(
              "text-wrap-mode",
              (value) => value.is("wrap"),
              device,
            ),
            hasSoftWrapPoints(device),
          ),
          ancestor,
        )
      ) {
        // The element both allows wrapping and has soft wrap points for it to
        // actually occur.
        return Overflow.Handle;
      }

      if (
        hasUsedStyle(
          "flex-wrap",
          (value) => !value.is("nowrap"),
          device,
        )(ancestor)
      ) {
        // The element is a wrapping flex container, children will wrap
        // It may still overflow if individual children are too big, but we
        // assume this won't happen; this only creates false negatives.
        return Overflow.Handle;
      }

      let horizontalOverflow = overflow(ancestor, device, "x");
      if (horizontalOverflow === Overflow.Clip) {
        if (
          inSameBlock &&
          hasUsedStyle(
            "text-overflow",
            (value) => value.is("ellipsis"),
            device,
          )(ancestor)
        ) {
          // As long as we are in the same block, we consider ellipsis as an
          // indication that clipping was taken into consideration.
          horizontalOverflow = Overflow.Handle;
        }

        if (
          constrainingAncestor(ancestor, device, "width").every(
            isTwiceAsBig(text, device)("width"),
          )
        ) {
          // If the element has no constraining ancestor or is twice as small as
          // it, it has room to grow.
          // We return a somewhat incorrect value here as it will ultimately
          // turn into an Outcome.WrapsText while a Outcome.IsContainer would
          // be more correct when there is a constraining ancestor. This is OK
          // since we do not really rely on that information anywhere.
          horizontalOverflow = Overflow.Handle;
        }
      }

      if (Style.isBlockContainer(style)) {
        // Are we exiting the block?
        inSameBlock = false;
      }

      return horizontalOverflow;
    };
  }

  const _softWrapPointsCache = Cache.empty<Device, Cache<Node, boolean>>();

  /**
   * Test whether a node contains soft wrap points: either within the texts,
   * or between its children (if allowed).
   */
  function hasSoftWrapPoints(device: Device): Predicate<Node> {
    return (node) =>
      _softWrapPointsCache.get(device, Cache.empty).get(node, () => {
        if (isText(node)) {
          // This is not fully correct, depending on languages
          return Style.hasSoftWrapOpportunity(device)(node);
        }

        if (isElement(node)) {
          // If the element itself refuses to wrap, it cancels the soft wrap
          // points of its children.
          if (
            hasComputedStyle(
              "text-wrap-mode",
              (value) => value.is("nowrap"),
              device,
            )(node)
          ) {
            return false;
          }

          // If the element has only one child, that child must have wrap points.
          // Otherwise, we assume that soft wrap points exist in-between children.
          // This is not fully correct since inter-element spaces is needed for
          // that, e.g. we incorrectly consider that
          // `<div><span>he</span><span>llo</span></div>` has wrap points between
          // the `<span>`.
          // This is OK-ish because Alfa does explicit the inter-elements space.
          const children = node.children(Node.fullTree);
          return (
            children.size > 1 ||
            children.first().some(hasSoftWrapPoints(device))
          );
        }

        return false;
      });
  }

  const constrainingCaches = {
    height: Cache.empty<Device, Cache<Element, Option<Element>>>(),
    width: Cache.empty<Device, Cache<Element, Option<Element>>>(),
  };

  /**
   * Finds the closest ancestor which "constraints" the element in the given
   * dimension.
   *
   * @remarks
   * An element is constraining if it has fixed dimension, or it is \<body\> in
   * the horizontal dimension. I.e. we consider \<body\> to be infinitely
   * scrolling vertically, but immovable horizontally. This is not fully
   *   correct, but a horizontal scroll bar on it must be explicitly added by
   *   having a wider element that doesn't wrap, so it should be good in most
   *   actual cases.
   *
   * If the constraining ancestor is twice as big as the text, this leaves room
   * to grow and the text will pass the rule.
   */
  function constrainingAncestor(
    element: Element,
    device: Device,
    dimension: "height" | "width",
  ): Option<Element> {
    return constrainingCaches[dimension]
      .get(device, Cache.empty)
      .get(element, () =>
        hasFixedDimension(device, dimension)(element) ||
        // The <body> element is horizontally constrained by the viewport
        // That is we consider infinite scroll vertically, not horizontally.
        (dimension === "width" && hasName("body")(element))
          ? Option.of(element)
          : getPositioningParent(element, device).flatMap<Element>((parent) =>
              constrainingAncestor(parent, device, dimension),
            ),
      );
  }

  /**
   * Checks if an element has fixed (not font relative) dimension.
   *
   * @remarks
   * We use the cascaded value to avoid lengths being resolved to pixels.
   * Otherwise, we won't be able to tell if a font relative length was
   * used.
   *
   * @remarks
   * Calculated values cannot be resolved at cascade time. So we just accept
   * them (consider they are font relative) to avoid more false positives.
   *
   * @remarks
   * For dimensions set via the `style` attribute (the style has no parent),
   * we assume that its value is controlled by JavaScript and is adjusted
   * as the content scales.
   *
   */
  function hasFixedDimension(
    device: Device,
    dimension: "height" | "width",
  ): Predicate<Element> {
    return hasCascadedStyle(
      dimension,
      (value, source) =>
        // not a length => "auto", i.e not fixed.
        Length.isLength(value) &&
        // We bail out on calculated dimensions
        !value.hasCalculation() &&
        // 0 is a special case making the content invisible anyway.
        value.value > 0 &&
        // Font relative dimension is good
        !value.isFontRelative() &&
        // No source means the style is set via the `style` attribute
        source.some((declaration) => declaration.parent.isSome()),
      device,
    );
  }
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
namespace Media {
  export function usesFontRelativeMediaRule(
    device: Device,
    predicate: Predicate<Feature.Media.Feature>,
    context: Context = Context.empty(),
  ): Predicate<Element> {
    return usesMediaRule(isFontRelativeMediaRule(predicate), device, context);
  }

  const _mediaRulesCache = Cache.empty<CSSRule, Sequence<MediaRule>>();
  function ancestorMediaRules(rule: CSSRule | null): Sequence<MediaRule> {
    if (rule === null) {
      return Sequence.empty();
    }

    return _mediaRulesCache.get(rule, () => {
      const mediaRules = rule.parent
        .map((parent) => ancestorMediaRules(parent))
        .getOrElse<Sequence<MediaRule>>(Sequence.empty);

      return MediaRule.isMediaRule(rule)
        ? mediaRules.prepend(rule)
        : mediaRules;
    });
  }

  const _ruleTreeCache = Cache.empty<RuleTree.Node, Sequence<RuleTree.Node>>();
  function ancestorsInRuleTree(rule: RuleTree.Node): Sequence<RuleTree.Node> {
    return _ruleTreeCache.get(rule, () =>
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
   * Checks whether at least one feature in one of the queries of the media
   * rule is a font-relative one. Only checks feature matching the predicate.
   *
   * @remarks
   * We currently do not support calculated media queries. But this is lost in
   * the typing of Media.Feature. Here, we simply consider them as "good"
   * (font relative).
   */
  function isFontRelativeMediaRule(
    predicate: Predicate<Feature.Media.Feature>,
  ): Predicate<MediaRule> {
    return (rule) =>
      Iterable.some(rule.queries.queries, (query) =>
        query.condition.some((condition) =>
          Iterable.some(
            condition,
            (feature) =>
              predicate(feature) &&
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

  protected constructor(
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

  public toJSON(options?: Node.SerializationOptions): ClippingAncestors.JSON {
    return {
      ...super.toJSON(options),
      horizontal: this._horizontal.toJSON(options),
      vertical: this._vertical.toJSON(options),
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
