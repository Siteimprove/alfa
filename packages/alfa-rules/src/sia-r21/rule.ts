import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isProgrammaticallyHidden } = DOM;
const { hasAttribute, hasNamespace, isElement } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r21",
  requirements: [Technique.of("ARIA4"), Technique.of("G108")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .descendants(Node.fullTree)
            .filter(isElement)
            .filter(
              and(
                hasNamespace(Namespace.HTML, Namespace.SVG),
                hasAttribute("role", (value) => value.trim().length > 0),
                not(isProgrammaticallyHidden(device))
              )
            )
            // The previous filter ensures the existence of role.
            .map((element) => element.attribute("role").getUnsafe())
        );
      },

      expectations(target) {
        return {
          1: expectation(
            target
              .tokens()
              .every(
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

export namespace Outcomes {
  export const HasValidRole = Ok.of(
    Diagnostic.of(`The element has only valid roles`)
  );

  export const HasNoValidRole = Err.of(
    Diagnostic.of(`The element does not have at least one valid role`)
  );
}
