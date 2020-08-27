import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Ok, Err } from "@siteimprove/alfa-result";
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

        let outcome: Result<Diagnostic> = Outcomes.IsNormal;

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
    Diagnostic.of(`The line height of the \`<p>\` element is at least 1.5`)
  );

  export const IsInsufficient = Err.of(
    Diagnostic.of(`The line height of the \`<p>\` element is less than 1.5`)
  );

  export const IsNormal = Err.of(
    Diagnostic.of(
      `The line height of the \`<p>\` element is \`normal\` which will result in
      a line height of less than 1.5`
    )
  );
}
