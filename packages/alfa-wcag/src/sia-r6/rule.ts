import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R6: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r6.html",
  requirements: [{ id: "wcag:language-of-page", partial: true }],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(document, document, node => {
          return (
            isElement(node) &&
            isDocumentElement(node, document) &&
            hasValidLanguageAttributes(node)
          );
        }).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        const lang = getLanguage(getAttribute(target, "lang")!)!;
        const xmlLang = getLanguage(getAttribute(target, "xml:lang")!)!;

        return {
          1: { holds: lang.primary === xmlLang.primary }
        };
      }
    };
  }
};

function hasValidLanguageAttributes(element: Element): boolean {
  const lang = getAttribute(element, "lang");
  const xmlLang = getAttribute(element, "xml:lang");

  if (lang === null || xmlLang === null) {
    return false;
  }

  const parsedLang = getLanguage(lang);
  const parsedXmlLang = getLanguage(xmlLang);

  return parsedLang !== null && parsedXmlLang !== null;
}
