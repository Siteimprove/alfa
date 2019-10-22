import { Atomic } from "@siteimprove/alfa-act";
import { List, Seq } from "@siteimprove/alfa-collection";
import { Predicate } from "@siteimprove/alfa-compatibility";
import {
  Attribute,
  Document,
  Element,
  getAttributeNode,
  hasAttribute,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { getLanguage } from "@siteimprove/alfa-iana";
import { isDocumentElement } from "../helpers/is-document-element";
import { isElement } from "../helpers/predicates";

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
            Predicate.from(
              isElement
                .and(element => isDocumentElement(element, document))
                .and(element => hasAttribute(element, "lang"))
            )
          )
        )
          .reduce<List<Attribute>>((attributes, element) => {
            const languages: Array<Attribute> = [];

            const lang = getAttributeNode(element, "lang");

            if (lang !== null && lang.value.trim() !== "") {
              languages.push(lang);
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
