import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasExplicitRole } from "../common/predicate/has-role";
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
                hasAttribute("role", not(isEmpty)),
                not(isIgnored(device))
              )
            )
          )
          .map((element) => element.attribute("role").get());
      },

      expectations(target) {
        const owner = target.owner.get();

        return {
          1: expectation(
            hasExplicitRole()(owner),
            () => Outcomes.HasValidRole,
            () => Outcomes.HasNoValidRole
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasValidRole = Ok.of("The element has a valid role");

  export const HasNoValidRole = Err.of(
    "The element does not have a valid role"
  );
}
