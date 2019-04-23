import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R4: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r4.html",
  requirements: [{ id: "wcag:language-of-page", partial: true }],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(document, document, node => {
          return isElement(node) && isDocumentElement(node, document);
        }).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        return {
          1: { holds: hasLanguageAttribute(target) }
        };
      }
    };
  }
};
