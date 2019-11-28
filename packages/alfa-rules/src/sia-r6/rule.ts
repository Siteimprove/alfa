import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { filter, isEmpty } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove/github.io/sanshikan/rules/sia-r6.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          document.children(),
          and(
            Element.isElement,
            and(
              isDocumentElement(),
              and(
                hasAttribute("lang", value => Language.from(value).isSome()),
                hasAttribute("xml:lang", not(isEmpty))
              )
            )
          )
        );
      },

      expectations(target) {
        const lang = Language.from(target.attribute("lang").get().value).get();
        const xmlLang = Language.from(target.attribute("xml:lang").get().value);

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
