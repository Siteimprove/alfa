import { Atomic } from "@siteimprove/alfa-act";
import {
  Attribute,
  Document,
  Element,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { concat } from "@siteimprove/alfa-util";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R5: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r5.html",
  requirements: ["wcag:language-of-page"],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
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

          for (let i = 0, n = element.attributes.length; i < n; i++) {
            const attribute = element.attributes[i];

            if (attribute.localName === "lang") {
              if (attribute.value.trim() === "") {
                continue;
              }

              if (attribute.prefix === null || attribute.prefix === "xml") {
                languages.push(attribute);
              }
            }
          }

          return languages;
        })
        .reduce(concat, [])
    );

    expectations((target, expectation) => {
      expectation(1, getLanguage(target.value) !== null);
    });
  }
};
