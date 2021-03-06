import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole, isVisible } from "../common/predicate";

const { isElement } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r71",
  requirements: [Criterion.of("1.4.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(isElement)
          .filter(and(hasRole(device, "paragraph"), isVisible(device)));
      },

      expectations(target) {
        const { value: align } = Style.from(target, device).computed(
          "text-align"
        );

        return {
          1: expectation(
            align.value !== "justify",
            () => Outcomes.IsNotJustified,
            () => Outcomes.IsJustified
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotJustified = Ok.of(
    Diagnostic.of(`The text of the paragraph is not justified`)
  );

  export const IsJustified = Err.of(
    Diagnostic.of(`The text of the paragraph is justified`)
  );
}
