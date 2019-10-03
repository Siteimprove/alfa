import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

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
            querySelectorAll<Element>(document, document, isElement(), {
              flattened: true
            }),
            element =>
              isElement(builder =>
                builder
                  .withNamespace(document, Namespace.HTML)
                  .withRole(
                    device,
                    document,
                    Roles.Checkbox,
                    Roles.Combobox,
                    Roles.ListBox,
                    Roles.MenuItemCheckbox,
                    Roles.MenuItemRadio,
                    Roles.Radio,
                    Roles.SearchBox,
                    Roles.Slider,
                    Roles.SpinButton,
                    Roles.Switch,
                    Roles.TextBox
                  )
                  .and(element => isExposed(element, document, device))
              )(element)
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
