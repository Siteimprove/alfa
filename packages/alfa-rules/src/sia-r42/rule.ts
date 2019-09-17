import { Atomic } from "@siteimprove/alfa-act";
import { getOwnerElement, getRole, isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

import { ElementChecker } from "../helpers/element-checker";
import { getExplicitRole } from "../helpers/get-explicit-role";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R42: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r42.html",
  requirements: [
    { requirement: "wcag", criterion: "info-and-relationships", partial: true }
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
                return isHtmlOrSvgElement(node, document);
              },
              {
                flattened: true
              }
            ),
            element => {
              return map(isExposed(element, document, device), isExposed => {
                if (!isExposed) {
                  return false;
                }

                return map(getExplicitRole(element, document, device), role => {
                  return (
                    role !== null &&
                    role.context !== undefined &&
                    [...role.context(element, document, device)].length > 0
                  );
                });
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

      expectations: (aspect, target, question) => {
        return map(
          hasRequiredContext(target, document, device),
          hasRequiredContext => {
            return {
              1: { holds: hasRequiredContext }
            };
          }
        );
      }
    };
  }
};

function isHtmlOrSvgElement(node: Node, context: Node): node is Element {
  return new ElementChecker()
    .withContext(context)
    .withNamespace(Namespace.HTML, Namespace.SVG)
    .evaluate(node) as boolean;
}

function hasRequiredContext(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getOwnerElement(element, document, device), ownerElement => {
    if (ownerElement === null) {
      return false;
    }

    return map(getRole(element, context, device), role => {
      const required = role!.context!(element, context, device);

      return map(getRole(ownerElement, context, device), role => {
        if (role !== null) {
          for (const found of required) {
            if (found === role) {
              return true;
            }
          }
        }

        return false;
      });
    });
  });
}
