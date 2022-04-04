import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import {
  hasNonEmptyAccessibleName,
  hasRole,
  isIgnored,
} from "../common/predicate";
import { Scope } from "../tags";

const { hasIncorrectRoleWithoutName } = DOM;
const { isElement } = Element;
const { and, not } = Predicate;

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
            .filter(
              and(
                hasRole(device, (role) => role.is("region")),
                not(isIgnored(device))
              )
            )
            // circumventing https://github.com/Siteimprove/alfa/issues/298
            .reject(hasIncorrectRoleWithoutName(device))
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
