import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R11: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r11.html",
  requirements: [
    { id: "wcag:link-purpose-in-context", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  definition: (applicability, expectations, { device, document }) => {
    applicability(document, () =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isLink(node, document, device) &&
          some(isExposed(node, document, device))
      )
    );

    expectations((aspect, target, expectation) => {
      expectation(1, hasTextAlternative(target, document, device));
    });
  }
};

function isLink(element: Element, context: Node, device: Device): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    some(getRole(element, context, device), role => role === Roles.Link)
  );
}
