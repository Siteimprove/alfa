import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import {
  hasAttribute,
  hasInclusiveDescendant,
  isTabbable,
} from "../common/predicate";
import { Scope } from "../tags";

const { not, equals } = Predicate;
const { and } = Refinement;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r17",
  requirements: [Criterion.of("1.3.1"), Criterion.of("4.1.2")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(hasAttribute("aria-hidden", equals("true")));
      },

      expectations(target) {
        return {
          1: expectation(
            not(
              hasInclusiveDescendant(and(isElement, isTabbable(device)), {
                flattened: true,
              })
            )(target),
            () => Outcomes.IsNotTabbable,
            () => Outcomes.IsTabbable
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotTabbable = Ok.of(
    Diagnostic.of(
      `The element is neither tabbable nor has tabbable descendants`
    )
  );

  export const IsTabbable = Err.of(
    Diagnostic.of(`The element is either tabbable or has tabbable descendants`)
  );
}
