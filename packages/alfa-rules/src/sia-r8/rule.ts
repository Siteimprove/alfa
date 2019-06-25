import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
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

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R8: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r8.html",
  requirements: [
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll<Element>(
              document,
              document,
              node => {
                return isElement(node) && isFormField(node, document, device);
              },
              {
                flattened: true
              }
            ),
            element => {
              return isExposed(element, document, device);
            }
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
                applicable: true,
                aspect: document,
                target: element
              };
            });
          }
        );
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
