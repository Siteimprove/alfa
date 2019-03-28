import { Atomic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  isTabbable,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R17: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r17.html",
  requirements: [{ id: "wcag:info-and-relationships", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(document, document, node => {
          return (
            isElement(node) &&
            getAttribute(node, "aria-hidden", { lowerCase: true }) === "true"
          );
        }).map(attribute => {
          return {
            applicable: true,
            aspect: document,
            target: attribute
          };
        });
      },

      expectations: (aspect, target) => {
        return {
          1: { holds: !isTabbable(target, document, device) },
          2: { holds: !hasTabbableDescendants(target, document, device) }
        };
      }
    };
  }
};

function hasTabbableDescendants(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return (
    querySelector(
      element,
      context,
      node => {
        return (
          node !== element &&
          isElement(node) &&
          isTabbable(node, context, device)
        );
      },
      {
        flattened: true
      }
    ) !== null
  );
}
