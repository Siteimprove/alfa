import { Atomic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  isFocusable,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R17: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r17.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          getAttribute(node, "aria-hidden", { lowerCase: true }) === "true"
      )
    );

    expectations((target, expectation) => {
      expectation(1, !isFocusable(target, document, device));
      expectation(2, !hasFocusableDescendants(target, document, device));
    });
  }
};

function hasFocusableDescendants(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return (
    querySelector(
      element,
      context,
      node =>
        node !== element &&
        isElement(node) &&
        isFocusable(node, context, device)
    ) !== null
  );
}
