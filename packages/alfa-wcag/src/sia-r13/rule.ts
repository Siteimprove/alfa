import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
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

const { map } = BrowserSpecific;

export const SIA_R13: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r13.html",
  requirements: [
    { id: "wcag:link-purpose-in-context", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(document, document, node => {
          return isElement(node) && isIframe(node, document);
        }).map(element => {
          return map(isExposed(element, document, device), isExposed => {
            return {
              applicable: isExposed,
              aspect: document,
              target: element
            };
          });
        });
      },

      expectations: (aspect, target) => {
        return map(
          hasTextAlternative(target, document, device),
          hasTextAlternative => {
            return {
              1: { holds: hasTextAlternative }
            };
          }
        );
      }
    };
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
