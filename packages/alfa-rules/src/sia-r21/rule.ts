import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { filter, map, isEmpty } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r21.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return map(
          filter(
            document.descendants({ flattened: true, nested: true }),
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
                and(hasAttribute("role", not(isEmpty)), not(isIgnored(device)))
              )
            )
          ),
          element => element.attribute("role").get()
        );
      },

      expectations(target) {
        const owner = target.owner.get();

        return {
          1: expectation(
            hasRole(() => true, { implicit: false })(owner),
            Outcomes.HasValidRole,
            Outcomes.HasNoValidRole
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasValidRole = Ok.of("The element has a valid role");

  export const HasNoValidRole = Err.of(
    "The element does not have a valid role"
  );
}
