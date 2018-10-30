import { Atomic } from "@siteimprove/alfa-act";
import { isVisible, Roles } from "@siteimprove/alfa-aria";
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

export const SIA_R21: Atomic.Rule<Document, Attribute> = {
  id: "sanshikan:rules/sia-r21.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    const roleNames = new Set(values(Roles).map(role => role.name));

    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isVisible(node, document) &&
          isHtmlOrSvgElement(node, document) &&
          hasAttribute(node, "role") &&
          getAttribute(node, "role", { trim: true }) !== ""
      ).map(element => getAttributeNode(element, "role")!)
    );

    expectations((target, expectation) => {
      expectation(
        1,
        target.value.split(/\s+/).some(role => roleNames.has(role))
      );
    });
  }
};

function isHtmlOrSvgElement(element: Element, context: Node): boolean {
  const namespace = getElementNamespace(element, context);

  return namespace === Namespace.HTML || namespace === Namespace.SVG;
}
