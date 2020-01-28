import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isWhitespace } from "../common/predicate/is-whitespace";

const { filter, isEmpty } = Iterable;
const { and, nor, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r4.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          document.children(),
          and(Element.isElement, isDocumentElement())
        );
      },

      expectations(target) {
        return {
          1: test(hasAttribute("lang", nor(isEmpty, isWhitespace)), target)
            ? Some.of(
                Ok.of(
                  "The lang attribute exists and is neither empty nor only whitespace"
                ) as Result<string, string>
              )
            : Some.of(
                Err.of(
                  "The lang attribute is either missing, empty, or only whitespace"
                ) as Result<string, string>
              )
        };
      }
    };
  }
});
