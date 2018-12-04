import { Atomic } from "@siteimprove/alfa-act";
import {
  Attribute,
  Document,
  Element,
  getAttributeNode,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { concat } from "@siteimprove/alfa-util";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R5: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r5.html",
  requirements: [{ id: "wcag:language-of-page", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(document, () =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isDocumentElement(node, document) &&
          hasLanguageAttribute(node)
      )
        .map(element => {
          const languages: Array<Attribute> = [];

          const lang = getAttributeNode(element, "lang");

          if (lang !== null && lang.value.trim() !== "") {
            languages.push(lang);
          }

          const xmlLang = getAttributeNode(element, "xml:lang");

          if (xmlLang !== null && xmlLang.value.trim() !== "") {
            languages.push(xmlLang);
          }

          return languages;
        })
        .reduce(concat, [])
    );

    expectations((aspect, target, expectation) => {
      expectation(1, getLanguage(target.value) !== null);
    });
  }
};
