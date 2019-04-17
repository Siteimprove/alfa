import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isExposed,
  Roles
} from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export const SIA_R40: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r40.html",
  requirements: [{ id: "aria", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll(document, document, isElement).map(element => {
          return map(getRole(element, document, device), role => {
            if (role !== Roles.Region) {
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

      expectations: (aspect, target, question) => {
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
