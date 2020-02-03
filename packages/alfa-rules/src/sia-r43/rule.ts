import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { filter, isEmpty } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r43.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.SVG)),
              and(
                hasRole(
                  hasName(
                    equals("img", "graphics-document", "graphics-symbol")
                  ),
                  { implicit: false }
                ),
                not(isIgnored(device))
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device, not(isEmpty))(target),
            Outcomes.HasName(target.name),
            Outcomes.HasNoName(target.name)
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasName = (target: string): Result<string, string> =>
    Ok.of(`The <${target}> element has an accessible name`);

  export const HasNoName = (target: string): Result<string, string> =>
    Err.of(`The <${target}> element does not have an accessible name`);
}
