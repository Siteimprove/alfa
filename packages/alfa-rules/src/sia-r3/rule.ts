import { Atomic } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import {
  Document,
  Element,
  getId,
  getRootNode,
  isElement,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R3: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r3.html",
  requirements: [{ requirement: "wcag", criterion: "parsing", partial: true }],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return Seq(
          querySelectorAll<Element>(
            document,
            document,
            node => {
              return isElement(node) && hasId(node, document);
            },
            {
              composed: true
            }
          )
        ).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        return {
          1: { holds: hasUniqueId(target, document) }
        };
      }
    };
  }
};

function hasId(element: Element, context: Node): boolean {
  const id = getId(element);
  return id !== null && id !== "";
}

function hasUniqueId(element: Element, context: Node): boolean {
  const id = getId(element);
  return (
    querySelector(
      getRootNode(element, context),
      context,
      node => isElement(node) && getId(node) === id && node !== element
    ) === null
  );
}
