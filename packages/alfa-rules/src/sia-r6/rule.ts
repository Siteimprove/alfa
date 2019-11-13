import { Rule } from "@siteimprove/alfa-act";
import { Element, getAttribute, isElement, Node } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isEmpty } from "../common/predicate/is-empty";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove/github.io/sanshikan/rules/sia-r6.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          walk(document, document),
          and(
            isElement,
            and(
              isDocumentElement(document),
              and(
                hasValidLanguageAttribute(document),
                hasAttribute(document, "xml:lang", not(isEmpty))
              )
            )
          )
        );
      },

      expectations(target) {
        const lang = Language.from(
          getAttribute(target, document, "lang").get()
        ).get();

        const xmlLang = Language.from(
          getAttribute(target, document, "xml:lang").get()
        );

        return {
          1:
            xmlLang.isNone() ||
            xmlLang.filter(xmlLang => xmlLang.primary === lang.primary).isSome()
              ? Ok.of(
                  "The lang and xml:lang attributes have matching primary language subtags"
                )
              : Err.of(
                  "The lang and xml:lang attributes do not have matching primary language subtags"
                )
        };
      }
    };
  }
});

function hasValidLanguageAttribute(context: Node): Predicate<Element> {
  return element =>
    getAttribute(element, context, "lang")
      .flatMap(Language.from)
      .isSome();
}
