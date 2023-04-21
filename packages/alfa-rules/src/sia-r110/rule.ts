import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Attribute } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { roleAttributes } from "../common/applicability/role-attributes";

import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r110",
  requirements: [
    Criterion.of("1.3.1"),
    Technique.of("ARIA4"),
    Technique.of("G108"),
  ],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return roleAttributes(document, device);
      },

      expectations(target) {
        return {
          1: expectation(
            target
              .tokens()
              .some(
                (token) => Role.isName(token) && Role.of(token).isConcrete()
              ),
            () => Outcomes.HasValidRole,
            () => Outcomes.HasNoValidRole
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidRole = Ok.of(
    Diagnostic.of(`The element has a at least one valid role`)
  );

  export const HasNoValidRole = Err.of(
    Diagnostic.of(`The element does not have a valid role`)
  );
}
