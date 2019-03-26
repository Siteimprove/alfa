import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  getTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
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

export const SIA_R11: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r11.html",
  requirements: [
    { id: "wcag:link-purpose-in-context", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll(document, document, isElement).map(element => {
          return map(isLink(element, document, device), isLink => {
            if (!isLink) {
              return {
                applicable: false,
                aspect: document,
                target: element
              };
            }

            return map(isExposed(element, document, device), isExposed => {
              return {
                applicable: isExposed,
                aspect: document,
                target: element
              };
            });
          });
        });
      },

      expectations: (aspect, target) => {
        return map(
          getTextAlternative(target, document, device),
          textAlternative => {
            return {
              1: { holds: textAlternative !== null && textAlternative !== "" }
            };
          }
        );
      }
    };
  }
};

function isLink(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return BrowserSpecific.map(
    getRole(element, context, device),
    role => role === Roles.Link
  );
}
