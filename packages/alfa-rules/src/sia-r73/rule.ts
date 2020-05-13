import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
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
        const { value: fontSize } = style.computed("font-size");

        return {
          1: expectation(
            lineHeight.type === "number" && lineHeight.value >= 1.5,
            () => Outcomes.IsSufficient,
            () =>
              expectation(
                lineHeight.type === "length" &&
                  lineHeight.value / fontSize.value >= 1.5,
                () => Outcomes.IsSufficient,
                () =>
                  expectation(
                    lineHeight.type === "keyword" &&
                      lineHeight.value === "normal",
                    () => Outcomes.IsNormal,
                    () => Outcomes.IsInsufficient
                  )
              )
          ),
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
