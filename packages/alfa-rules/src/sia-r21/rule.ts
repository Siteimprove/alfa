import { Atomic } from "@siteimprove/alfa-act";
import { getRole, isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  getAttribute,
  getAttributeNode,
  getElementNamespace,
  getOwnerElement,
  hasAttribute,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R21: Atomic.Rule<Device | Document, Attribute> = {
  id: "sanshikan:rules/sia-r21.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll<Element>(document, document, node => {
              return (
                isElement(node) &&
                isHtmlOrSvgElement(node, document) &&
                hasAttribute(node, "role") &&
                getAttribute(node, "role") !== ""
              );
            }),
            element => {
              return isExposed(element, document, device);
            }
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
                applicable: true,
                aspect: document,
                target: getAttributeNode(element, "role")!
              };
            });
          }
        );
      },

      expectations: (aspect, target) => {
        const owner = getOwnerElement(target, document)!;

        return map(
          getRole(owner, document, device, { implicit: false }),
          role => {
            return {
              1: { holds: role !== null }
            };
          }
        );
      }
    };
  }
};

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  const namespace = getElementNamespace(element, context);

  return namespace === Namespace.HTML || namespace === Namespace.SVG;
}
