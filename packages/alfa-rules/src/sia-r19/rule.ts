import { Atomic } from "@siteimprove/alfa-act";
import { Attributes } from "@siteimprove/alfa-aria";
import { List, Seq } from "@siteimprove/alfa-collection";
import {
  Attribute,
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { URL, values } from "@siteimprove/alfa-util";

import { EN } from "./locales/en";

const whitespace = /\s+/;

export const SIA_R19: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r19.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  locales: [EN],
  evaluate: ({ document }) => {
    const attributeNames = new Set(
      values(Attributes).map(attribute => attribute.name)
    );

    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(document, document, node => {
            return isElement(node) && isHtmlOrSvgElement(node, document);
          })
        )
          .reduce<List<Attribute>>((attributes, element) => {
            return attributes.concat(
              Array.from(element.attributes).filter(attribute => {
                return (
                  attributeNames.has(attribute.localName) &&
                  attribute.value.trim() !== ""
                );
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
        const attribute = values(Attributes).find(
          attribute => attribute.name === target.localName
        )!;

        const { value } = target;

        let valid = true;

        switch (attribute.type) {
          case "true-false":
            valid = value === "true" || value === "false";
            break;

          case "true-false-undefined":
            valid =
              value === "true" || value === "false" || value === "undefined";
            break;

          case "tristate":
            valid = value === "true" || value === "false" || value === "mixed";
            break;

          case "id-reference":
            valid = whitespace.test(value) === false;
            break;

          case "id-reference-list":
            valid = true;
            break;

          case "integer":
            valid = /^\d+$/.test(value);
            break;

          case "number":
            valid = /^\d+(\.\d+)?$/.test(value);
            break;

          case "token":
            valid =
              attribute.values!.find(found => found === value) !== undefined;
            break;

          case "token-list":
            valid =
              value
                .split(/\s+/)
                .find(
                  found =>
                    attribute.values!.find(value => value === found) ===
                    undefined
                ) === undefined;
            break;

          case "uri":
            try {
              new URL(value);
            } catch (err) {
              valid = false;
            }
        }

        return { 1: { holds: valid } };
      }
    };
  }
};

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  const namespace = getElementNamespace(element, context);

  return namespace === Namespace.HTML || namespace === Namespace.SVG;
}
