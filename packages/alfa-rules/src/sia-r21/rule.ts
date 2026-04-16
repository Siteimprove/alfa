import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import type { Attribute } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.ts";
import { roleAttributes } from "../common/applicability/role-attributes.ts";
import { BestPractice } from "../requirements/index.ts";

import { Scope, Stability } from "../tags/index.ts";

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r21",
  requirements: [BestPractice.of("all-roles-valid")],
  tags: [Scope.Component, Stability.Stable],
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
              .every(
                (token) => Role.isName(token) && Role.of(token).isConcrete(),
              ),
            () => Outcomes.HasValidRole,
            () => Outcomes.HasNoValidRole,
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
    Diagnostic.of(`The element has only valid roles`),
  );

  export const HasNoValidRole = Err.of(
    Diagnostic.of(`The element does not have at least one valid role`),
  );
}
