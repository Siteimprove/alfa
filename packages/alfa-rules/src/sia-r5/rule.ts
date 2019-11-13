import { Rule } from "@siteimprove/alfa-act";
import { Attribute, getAttributeNode, isElement } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isEmpty } from "../common/predicate/is-empty";
import { isWhitespace } from "../common/predicate/is-whitespace";

import { walk } from "../common/walk";

const { filter, map } = Iterable;
const { and, or, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r5.html",
  evaluate({ document }) {
    return {
      applicability() {
        return map(
          filter(
            walk(document, document),
            and(
              isElement,
              and(
                isDocumentElement(document),
                hasAttribute(document, "lang", not(or(isEmpty, isWhitespace)))
              )
            )
          ),
          element => getAttributeNode(element, document, "lang").get()
        );
      },

      expectations(target) {
        return {
          1: Language.from(target.value).isSome()
            ? Ok.of("The lang attribute has a valid primary language tag")
            : Err.of(
                "The lang attribute does not have a valid primary language tag"
              )
        };
      }
    };
  }
});
