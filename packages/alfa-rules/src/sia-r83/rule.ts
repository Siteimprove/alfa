import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
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

    if (
      style.computed("width").value.type === "keyword" &&
      style.computed("height").value.type === "keyword" &&
      style.computed("white-space").value.value !== "nowrap"
    ) {
      return false;
    }

    for (const property of ["overflow-x", "overflow-y"] as const) {
      const { value: overflow } = style.computed(property);

      switch (overflow.value) {
        case "hidden":
        case "clip":
          return true;
      }
    }

    return false;
  };
}

function wrapsText(device: Device): Predicate<Text> {
  return (text) =>
    text
      .parent()
      .filter(isElement)
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
            // the height. If it isn't, we need to check if an overflow could
            // cause the text to clip.
            if (lineHeight.value !== height.value) {
              for (const property of ["overflow-x", "overflow-y"] as const) {
                const { value: overflow } = style.computed(property);

                switch (overflow.value) {
                  case "hidden":
                  case "clip":
                    return false;
                }
              }
            }
          }
        }

        return true;
      });
}
