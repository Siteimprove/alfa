import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import {
  hasNonEmptyAccessibleName,
  hasExplicitRole,
  isIgnored,
} from "../common/predicate";
import { Scope } from "../tags";

const { and, not } = Predicate;
const { hasName } = Role;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r40",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .descendants({ flattened: true, nested: true })
            .filter(isElement)
            // The only elements with an implicit role of region are <section>
            // with an accessible name.
            // Alfa currently gives a role of region to all <section> because
            // it computes accessible names at a later step.
            // see https://github.com/Siteimprove/alfa/issues/298
            // Since those implicit region necessarily have an accessible name,
            // they pass the rule and are ignored here.
            // <section> without a name are incorrectly assigned a role of region
            // and would therefore incorrectly fail the rule.
            //
            // Therefore, the rule is restricted to explicit role of region
            // until #298 is solved.
            .filter(
              and(hasExplicitRole(hasName("region")), not(isIgnored(device)))
            )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of(
    Diagnostic.of(`The region has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The region does not have an accessible name`)
  );
}
