import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isVisible,
  Roles
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R12: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r12.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isButton(node, document, device) &&
          isVisible(node, document, device) &&
          getInputType(node) !== InputType.Image
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasTextAlternative(target, document, device));
    });
  }
};

function isButton(element: Element, context: Node, device: Device): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    some(getRole(element, context, device), role => role === Roles.Button)
  );
}
