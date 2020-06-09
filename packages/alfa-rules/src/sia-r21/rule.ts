import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r21.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML, Namespace.SVG),
                hasAttribute("role", (value) => not(isEmpty)(value.trim())),
                not(isIgnored(device))
              )
            )
          )
          .map((element) => element.attribute("role").get());
      },

      expectations(target) {
        return {
          1: expectation(
            target
              .tokens()
              .every((token) =>
                Role.lookup(token).some(
                  (role) => role.category !== Role.Category.Abstract
                )
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
