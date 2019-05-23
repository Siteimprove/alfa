import { Atomic } from "@siteimprove/alfa-act";
import { isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

import { getExplicitRole } from "../helpers/get-explicit-role";
import { hasExplicitRole } from "../helpers/has-explicit-role";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R16: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r16.html",
  requirements: [
    { requirement: "wcag", criterion: "name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, isElement, {
              composed: true
            }),
            element => {
              return map(isExposed(element, document, device), isExposed => {
                if (!isExposed) {
                  return false;
                }

                return hasExplicitRole(element, document, device);
              });
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
          hasRequiredValues(target, document, device),
          hasRequiredValues => {
            return {
              1: { holds: hasRequiredValues }
            };
          }
        );
      }
    };
  }
};

function hasRequiredValues(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getExplicitRole(element, context, device), role => {
    if (role === null || role.required === undefined) {
      return true;
    }

    const implicits =
      role.implicits === undefined
        ? []
        : role.implicits(element, context, device);

    for (const attribute of role.required(element, context, device)) {
      const value = getAttribute(element, attribute.name, {
        trim: true
      });

      if (value === null || value === "") {
        if (
          implicits.find(implicit => implicit[0] === attribute) === undefined
        ) {
          return false;
        }
      }
    }

    return true;
  });
}
