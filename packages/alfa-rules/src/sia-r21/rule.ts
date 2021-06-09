import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r21",
  requirements: [
    Criterion.of("1.3.1"),
    Technique.of("ARIA4"),
    Technique.of("G108"),
  ],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasAttribute("role", (value) => value.trim().length > 0),
              not(isIgnored(device))
            )
          )
          .map((element) => element.attribute("role").get());
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
    Diagnostic.of(`The element has a valid role`)
  );

  export const HasNoValidRole = Err.of(
    Diagnostic.of(`The element does not have a valid role`)
  );
}
