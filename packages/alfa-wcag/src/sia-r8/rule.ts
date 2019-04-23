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

export const SIA_R8: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r8.html",
  requirements: [{ id: "wcag:labels-or-instructions", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(
          document,
          document,
          node => {
            return isElement(node) && isFormField(node, document, device);
          },
          {
            flattened: true
          }
        ).map(element => {
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

function isFormField(element: Element, context: Node, device: Device): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  switch (getRole(element, context, device)) {
    case Roles.Checkbox:
    case Roles.Combobox:
    case Roles.ListBox:
    case Roles.MenuItemCheckbox:
    case Roles.MenuItemRadio:
    case Roles.Radio:
    case Roles.SearchBox:
    case Roles.Slider:
    case Roles.SpinButton:
    case Roles.Switch:
    case Roles.TextBox:
      return true;
  }

  return false;
}
