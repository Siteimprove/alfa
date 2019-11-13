import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isEmpty } from "../common/predicate/is-empty";
import { isWhitespace } from "../common/predicate/is-whitespace";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, or, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r4.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          walk(document, document),
          and(isElement, isDocumentElement(document))
        );
      },

      expectations(target) {
        return {
          1: test(
            hasAttribute(document, "lang", not(or(isEmpty, isWhitespace))),
            target
          )
            ? Ok.of("The lang attribute is neither empty nor only whitespace")
            : Err.of("The lang attribute is either empty or only whitespace")
        };
      }
    };
  }
});
