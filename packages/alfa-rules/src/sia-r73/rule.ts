import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r73.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(
            and(
              isElement,
              and(hasNamespace(Namespace.HTML), hasName("p"), isVisible(device))
            )
          );
      },

      expectations(target) {
        const style = Style.from(target, device);

        const { value: lineHeight } = style.computed("line-height");

        let outcome: Ok<string> | Err<string> = Outcomes.IsNormal;

        switch (lineHeight.type) {
          case "number":
            outcome =
              lineHeight.value >= 1.5
                ? Outcomes.IsSufficient
                : Outcomes.IsInsufficient;
            break;

          case "length": {
            const { value: fontSize } = style.computed("font-size");

            outcome =
              lineHeight.value / fontSize.value >= 1.5
                ? Outcomes.IsSufficient
                : Outcomes.IsInsufficient;
          }
        }

        return {
          1: Option.of(outcome),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsSufficient = Ok.of(
    "The line height of the paragraph is at least 1.5"
  );

  export const IsInsufficient = Err.of(
    "The line height of the paragraph is less than 1.5"
  );

  export const IsNormal = Err.of(
    `The line height of the paragraph is "normal", which will result in an
    effective line height of 1.2`
  );
}
