import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isVisible,
  Roles
} from "@siteimprove/alfa-aria";
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

export const SIA_R2: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r2.html",
  requirements: [{ id: "wcag:non-text-content", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node =>
          isElement(node) &&
          isImage(node, document, device) &&
          isVisible(node, document, device),
        { composed: true }
      )
    );

    expectations((target, expectation) => {
      expectation(
        1,
        hasTextAlternative(target, document, device) ||
          isDecorative(target, document, device)
      );
    });
  }
};

function isImage(element: Element, context: Node, device: Device): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return (
    element.localName === "img" ||
    getRole(element, context, device) === Roles.Img
  );
}

function isDecorative(
  element: Element,
  context: Node,
  device: Device
): boolean {
  switch (getRole(element, context, device)) {
    case Roles.None:
    case Roles.Presentation:
    case null:
      return true;
  }

  return false;
}
