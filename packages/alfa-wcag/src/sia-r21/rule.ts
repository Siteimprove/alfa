import { Atomic } from "@siteimprove/alfa-act";
import { isExposed, Roles } from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  getAttribute,
  getAttributeNode,
  getElementNamespace,
  hasAttribute,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";

export const SIA_R21: Atomic.Rule<Device | Document, Attribute> = {
  id: "sanshikan:rules/sia-r21.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    const roleNames = new Set(values(Roles).map(role => role.name));

    applicability(document, () => {
      return querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          some(isExposed(node, document, device)) &&
          isHtmlOrSvgElement(node, document) &&
          hasAttribute(node, "role") &&
          getAttribute(node, "role", { trim: true }) !== ""
      ).map(element => getAttributeNode(element, "role")!);
    });

    expectations((aspect, target) => {
      return {
        1: {
          holds: target.value.split(/\s+/).some(role => roleNames.has(role))
        }
      };
    });
  }
};

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  const namespace = getElementNamespace(element, context);

  return namespace === Namespace.HTML || namespace === Namespace.SVG;
}
