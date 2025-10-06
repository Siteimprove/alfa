import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import type { Attribute } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { roleAttributes } from "../common/applicability/role-attributes.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r110",
  requirements: [
    Criterion.of("1.3.1"),
    EAA.of("9.1.3.1"),
    Technique.of("ARIA4"),
    Technique.of("G108"),
  ],
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
              .some(
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
    Diagnostic.of(`The element has a at least one valid role`),
  );

  export const HasNoValidRole = Err.of(
    Diagnostic.of(`The element does not have a valid role`),
  );
}
