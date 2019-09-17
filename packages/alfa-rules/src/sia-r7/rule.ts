import { Atomic } from "@siteimprove/alfa-act";
import { List, Seq } from "@siteimprove/alfa-collection";
import {
  Attribute,
  Document,
  Element,
  getAttributeNode,
  isElement,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { ElementChecker } from "../helpers/element-checker";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";

export const SIA_R7: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r7.html",
  requirements: [
    { requirement: "wcag", criterion: "language-of-parts", partial: true }
  ],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        const body = querySelector(
          document,
          document,
          node => isElement(node) && isBody(node, document)
        );

        if (body === null) {
          return [];
        }

        return Seq(
          querySelectorAll<Element>(
            body,
            document,
            node => isElement(node) && hasLanguageAttribute(node),
            {
              flattened: true
            }
          )
        )
          .reduce<List<Attribute>>((attributes, element) => {
            const languages: Array<Attribute> = [];

            const lang = getAttributeNode(element, "lang");

            if (lang !== null && lang.value !== "") {
              languages.push(lang);
            }

            const xmlLang = getAttributeNode(element, "xml:lang");

            if (xmlLang !== null && xmlLang.value !== "") {
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

function isBody(element: Element, context: Node): boolean {
  return new ElementChecker()
    .withName("body")
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .evaluate(element) as boolean;
}
