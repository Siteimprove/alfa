import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isDecorative } from "../common/predicate/is-decorative";
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
              or(
                hasName(equals("img")),
                and(
                  hasRole(property("name", equals("img"))),
                  not(isIgnored(device))
                )
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            isDecorative(target),
            Outcomes.IsDecorative,
            expectation(
              hasAccessibleName(device)(target),
              Outcomes.HasAccessibleName,
              Outcomes.HasNoAccessibleNameNorIsDecorative
            )
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasAccessibleName = Ok.of("The image has an accessible name");

  export const IsDecorative = Ok.of("The image is marked as decorative");

  export const HasNoAccessibleNameNorIsDecorative = Err.of(
    "The image neither has an accessible name nor is marked as decorative"
  );
}
