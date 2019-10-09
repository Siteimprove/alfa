import { Atomic } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import { Predicate } from "@siteimprove/alfa-compatibility";
import {
  Document,
  Element,
  getAttribute,
  hasAttribute,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { isDocumentElement } from "../helpers/is-document-element";
import { isElement } from "../helpers/predicates";

export const SIA_R6: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r6.html",
  requirements: [
    { requirement: "wcag", criterion: "language-of-page", partial: true }
  ],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(
            document,
            document,
            Predicate.from(
              isElement
                .and(element => isDocumentElement(element, document))
                .and(hasValidLanguageAttribute)
                .and(element => hasAttribute(element, "xml:lang"))
            )
          )
        ).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        const lang = getLanguage(getAttribute(target, "lang")!)!;
        const xmlLang = getLanguage(getAttribute(target, "xml:lang")!);

        return {
          1: { holds: xmlLang !== null && lang.primary === xmlLang.primary }
        };
      }
    };
  }
};

function hasValidLanguageAttribute(element: Element): boolean {
  const lang = getAttribute(element, "lang");

  return lang !== null && getLanguage(lang) !== null;
}
