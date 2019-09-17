import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed, Roles } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { ElementChecker } from "../helpers/element-checker";

import { EN } from "./locales/en";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R12: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r12.html",
  locales: [EN],
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
                return (
                  isElement(node) && getInputType(node) !== InputType.Image
                );
              },
              {
                flattened: true
              }
            ),
            element => {
              return map(isButton(element, document, device), isButton => {
                if (!isButton) {
                  return false;
                }

                return isExposed(element, document, device);
              });
            }
          ),
          elements => {
            return Seq(elements).map(element => {
              return {
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

function isButton(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return new ElementChecker()
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .withRole(device, Roles.Button)
    .evaluate(element);
}
