import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isEmpty } from "../common/predicate/is-empty";
import { isIgnored } from "../common/predicate/is-ignored";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r43.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, equals(Namespace.SVG)),
              and(
                hasRole(
                  document,
                  role =>
                    test(
                      equals("img", "graphics-document", "graphics-symbol"),
                      role.name
                    ),
                  { implicit: false }
                ),
                not(isIgnored(document, device))
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasAccessibleName(document, device, not(isEmpty)), target)
            ? Ok.of("The <svg> element has an accessible name")
            : Err.of("The <svg> element has no accessible name")
        };
      }
    };
  }
});
