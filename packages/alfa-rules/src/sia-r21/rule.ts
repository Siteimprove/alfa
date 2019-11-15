import { Rule } from "@siteimprove/alfa-act";
import {
  Attribute,
  getAttributeNode,
  getOwnerElement,
  isElement,
  Namespace
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isEmpty } from "../common/predicate/is-empty";
import { isIgnored } from "../common/predicate/is-ignored";

import { walk } from "../common/walk";

const { filter, map } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r21.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return map(
          filter(
            walk(document, document, { flattened: true, nested: true }),
            and(
              isElement,
              and(
                hasNamespace(document, equals(Namespace.HTML, Namespace.SVG)),
                and(
                  hasAttribute(document, "role", not(isEmpty)),
                  not(isIgnored(document, device))
                )
              )
            )
          ),
          element => getAttributeNode(element, document, "role").get()
        );
      },

      expectations(target) {
        const owner = getOwnerElement(target, document).get();

        return {
          1: test(hasRole(document), owner)
            ? Ok.of("The element has a valid role")
            : Err.of("The element does not have a valid role")
        };
      }
    };
  }
});
