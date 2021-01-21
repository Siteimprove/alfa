import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Length, Number } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isVisible } from "../common/predicate/is-visible";

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { isElement, hasNamespace } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r83.html",
  requirements: [Criterion.of("1.4.4")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(node: Node, collect = false): Iterable<Text> {
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

          if (collect && test(and(isText, isVisible(device)), node)) {
            yield node;
          }

          if (test(and(isElement, isPossiblyClipped(device)), node)) {
            collect = true;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        return {
          1: expectation(
            wrapsText(device)(target),
            () => Outcomes.WrapsText,
            () => Outcomes.ClipsText
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const WrapsText = Ok.of(
    Diagnostic.of(`The text is wrapped without being clipped`)
  );

  export const ClipsText = Err.of(Diagnostic.of(`The text is clipped`));
}

function isPossiblyClipped(device: Device): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device);

    // Case 1: Words never wrap and will continue to expand along the x-axis.
    // In this case, text might clip if overflow of the x-axis is hidden.
    if (
      style
        .computed("white-space")
        .some((whiteSpace) => whiteSpace.value === "nowrap")
    ) {
      return style
        .computed("overflow-x")
        .some(
          (overflow) => overflow.value === "hidden" || overflow.value === "clip"
        );
    }

    // Case 2: The height of the element has been restricted. In this case, text
    // might clip if overflow of the y-axis is hidden.
    if (
      style.computed("height").some((height) => {
        switch (height.type) {
          case "percentage":
            return height.value > 0 && height.value < 1;

          case "length":
            return height.value > 0;

          default:
            return false;
        }
      })
    ) {
      return style
        .computed("overflow-y")
        .some(
          (overflow) => overflow.value === "hidden" || overflow.value === "clip"
        );
    }

    return false;
  };
}

function wrapsText(device: Device): Predicate<Text> {
  return (text) =>
    text
      .ancestors({ flattened: true })
      .filter(isElement)
      .find(isPossiblyClipped(device))
      .some((element) => {
        const style = Style.from(element, device);

        const { value: whitespace } = style.computed("white-space");

        // If whitespace does not cause wrapping, we need to check if a text
        // overflow could cause the text to clip.
        if (whitespace.value === "nowrap") {
          const { value: overflow } = style.computed("text-overflow");

          // We assume that the text won't clip if the text overflow is handled
          // any other way than clip.
          return overflow.value !== "clip";
        }

        let { value: lineHeight } = style.computed("line-height");

        // If the line height is "normal", find a used value
        if (lineHeight.type === "keyword") {
          lineHeight = normalLineHeight();
        }

        // If the line height is a number, resolve it against the font size of
        // the element.
        if (lineHeight.type === "number") {
          lineHeight = Length.of(
            lineHeight.value * style.computed("font-size").value.value,
            "px"
          );
        }

        // If the line height is a length, we need to check if a height has been
        // set which could cause the text to clip.
        if (lineHeight.type === "length") {
          const { value: height } = style.computed("height");

          if (height.type === "length") {
            // We assume that the text won't clip if the line height is equal to
            // the height.
            return lineHeight.value === height.value;
          }
        }

        return true;
      });
}

/**
 * "normal" line height is everything but normal…
 *
 * CSS recommends that it is "between 1.0 and 1.2"
 * @see https://drafts.csswg.org/css2/#valdef-line-height-normal
 *
 * MDN says that Desktop browsers use a value of roughly 1.2
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height#normal
 *
 * It actually depends on font metrics (ascent, descent, line gap)
 * These font metrics are platform dependant…
 * @see https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align
 *
 * @see https://github.com/servo/servo/blob/6a3c3a4e18370d5604644d5491430b82d51c5be9/components/layout_2020/flow/inline.rs#L807
 * @see https://github.com/servo/servo/blob/8de1b8d3f4d0e814980a1f7836a9e865e0d0f53b/components/gfx/platform/macos/font.rs#L287
 * @see https://github.com/servo/servo/blob/029049b48630f426ac5face4d9a9c0cd5195c66c/components/gfx/platform/windows/font.rs#L392
 *
 * @see https://github.com/chromium/chromium/blob/53675c0acf7691ec1686a6aab6aab624f9b8a232/third_party/blink/renderer/core/layout/ng/inline/ng_line_height_metrics.h#L63
 * @see https://github.com/chromium/chromium/blob/6efa1184771ace08f3e2162b0255c93526d1750d/third_party/blink/renderer/platform/fonts/font_metrics.cc
 *
 * Keeping the simple version for now, if this causes troubles, we can later
 * build a more complex version, possibly branched…
 */
function normalLineHeight(): Number {
  return Number.of(1.2);
}
