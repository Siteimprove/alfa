import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isEmpty } from "../common/predicate/is-empty";
import { isExposed } from "../common/predicate/is-exposed";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r13.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, equals(Namespace.HTML)),
              and(hasName(equals("iframe")), isExposed(document, device))
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasAccessibleName(document, device, not(isEmpty)), target)
            ? Ok.of("The <iframe> has an accessible name")
            : Err.of("The <iframe> does not have an accessible name")
        };
      }
    };
  }
});
