import { Atomic } from "@siteimprove/alfa-act";
import {
  Attribute,
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { concat } from "@siteimprove/alfa-util";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";

export const SIA_R7: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r7.html",
  requirements: ["wcag:language-of-parts"],
  definition: (applicability, expectations, { document }) => {
    applicability(() => {
      const body = querySelector(
        document,
        document,
        node => isElement(node) && isBody(node, document)
      );

      if (body === null) {
        return [];
      }

      return querySelectorAll<Element>(
        body,
        document,
        node => isElement(node) && hasLanguageAttribute(node)
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
        .reduce(concat, []);
    });

    expectations((target, expectation) => {
      expectation(1, getLanguage(target.value) !== null);
    });
  }
};

function isBody(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return element.localName === "body";
}
