import { Rule } from "@siteimprove/alfa-act";
import {
  Attribute,
  getAttributeNode,
  isElement,
  Namespace
} from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isEmpty } from "../common/predicate/is-empty";
import { isWhitespace } from "../common/predicate/is-whitespace";

import { walk } from "../common/walk";

const { filter, first, map } = Iterable;
const { and, or, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r7.html",
  evaluate({ document }) {
    return {
      applicability() {
        return first(
          filter(
            walk(document, document),
            and(
              isElement,
              and(
                hasNamespace(document, equals(Namespace.HTML)),
                hasName(equals("body"))
              )
            )
          )
        )
          .map(body =>
            map(
              filter(
                walk(body, document),
                and(
                  isElement,
                  hasAttribute(document, "lang", not(or(isEmpty, isWhitespace)))
                )
              ),
              element => getAttributeNode(element, document, "lang").get()
            )
          )
          .getOr([]);
      },

      expectations(target) {
        return {
          1: Language.from(target.value).isSome()
            ? Ok.of("The lang attribute has a valid primary language subtag")
            : Err.of(
                "The lang attribute does not have a valid primary language subtag"
              )
        };
      }
    };
  }
});
