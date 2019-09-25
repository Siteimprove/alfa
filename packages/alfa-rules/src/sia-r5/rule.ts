import { Atomic } from "@siteimprove/alfa-act";
import { List, Seq } from "@siteimprove/alfa-collection";
import {
  Attribute,
  Document,
  Element,
  getAttributeNode,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R5: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r5.html",
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
            node =>
              isElement(node) &&
              isDocumentElement(node, document) &&
              hasLanguageAttribute(node)
          )
        )
          .reduce<List<Attribute>>((attributes, element) => {
            const languages: Array<Attribute> = [];

            const lang = getAttributeNode(element, "lang");

            if (lang !== null && lang.value.trim() !== "") {
              languages.push(lang);
            }

            const xmlLang = getAttributeNode(element, "xml:lang");

            if (xmlLang !== null && xmlLang.value.trim() !== "") {
              languages.push(xmlLang);
            }

            return attributes.concat(languages);
          }, List())
          .map(attribute => {
            return {
              applicable: true,
              aspect: document,
              target: attribute
            };
          });
      },

      expectations: (aspect, target) => {
        return {
          1: { holds: getLanguage(target.value) !== null }
        };
      }
    };
  }
};
