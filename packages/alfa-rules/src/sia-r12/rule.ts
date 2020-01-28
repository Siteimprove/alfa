import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasInputType } from "../common/predicate/has-input-type";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { filter, isEmpty } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r12.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              not(hasInputType(equals("image"))),
              and(
                hasNamespace(equals(Namespace.HTML)),
                and(hasRole(hasName(equals("button"))), not(isIgnored(device)))
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasAccessibleName(device, not(isEmpty)), target)
            ? Outcomes.HasName
            : Outcomes.HasNoName
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasName = Some.of(
    Ok.of("The button has an accessible name") as Result<string, string>
  );

  export const HasNoName = Some.of(
    Err.of("The button does not have an accessible name") as Result<
      string,
      string
    >
  );
}
