import { Atomic } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R4: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r4.html",
  requirements: [
    { requirement: "wcag", criterion: "language-of-page", partial: true }
  ],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(document, document, node => {
            return isElement(node) && isDocumentElement(node, document);
          })
        ).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        const lang = getAttribute(target, "lang");
        const xmlLang = getAttribute(target, "xml:lang");

        return {
          1: {
            holds:
              (lang !== null && lang.trim() !== "") ||
              (xmlLang !== null && xmlLang.trim() !== "")
          }
        };
      }
    };
  }
};
