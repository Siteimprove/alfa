import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { filter } = Iterable;
const { and, or, not, equals, property } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r2.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML)),
              and(
                hasRole(property("name", equals("img"))),
                not(isIgnored(device))
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device)(target),
            Outcomes.HasAccessibleName,
            Outcomes.HasNoAccessibleName
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasAccessibleName = Ok.of("The image has an accessible name");

  export const HasNoAccessibleName = Err.of("The image has no accessible name");
}
