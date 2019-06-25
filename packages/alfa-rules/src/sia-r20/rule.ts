import { Atomic } from "@siteimprove/alfa-act";
import { Attributes } from "@siteimprove/alfa-aria";
import { List, Seq } from "@siteimprove/alfa-collection";
import {
  Attribute,
  Document,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";

export const SIA_R20: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r20.html",
  requirements: [
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ document }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    return {
      applicability: () => {
        return Seq(querySelectorAll(document, document, isElement))
          .reduce<List<Attribute>>((attributes, element) => {
            return attributes.concat(
              Array.from(element.attributes).filter(attribute => {
                return attribute.localName.startsWith("aria-");
              })
            );
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
          1: { holds: attributeNames.has(target.localName) }
        };
      }
    };
  }
};
