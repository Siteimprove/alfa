import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Element} from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Result } from "@siteimprove/alfa-result";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { and } = Predicate;
const { isVisible } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r73",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(hasRole(device, "paragraph"), isVisible(device)),
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

/**
 * @public
 */
export namespace Outcomes {
  export const IsSufficient = Ok.of(
    Diagnostic.of(`The line height of the paragraph is at least 1.5`),
  );

  export const IsInsufficient = Err.of(
    Diagnostic.of(`The line height of the paragraph is less than 1.5`),
  );

  export const IsNormal = Err.of(
    Diagnostic.of(
      `The line height of the paragraph is \`normal\` which will result in
      a line height of less than 1.5`,
    ),
  );
}
