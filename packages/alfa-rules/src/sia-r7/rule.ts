import { Atomic } from "@siteimprove/alfa-act";
import { List, Seq } from "@siteimprove/alfa-collection";
import {
  Attribute,
  Document,
  Element,
  getAttributeNode,
  Namespace,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isElement } from "../helpers/predicate-builder";

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
          isElement(builder =>
            builder.withNamespace(document, Namespace.HTML).withName("body")
          )
        );

        if (body === null) {
          return [];
        }

        return Seq(
          querySelectorAll<Element>(
            body,
            document,
            isElement(builder => builder.and(hasLanguageAttribute)),
            {
              flattened: true
            }
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
