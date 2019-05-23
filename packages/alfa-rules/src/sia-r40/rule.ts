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
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R40: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r40.html",
  requirements: [{ id: "aria:#region", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(querySelectorAll(document, document, isElement), element => {
            return map(getRole(element, document, device), role => {
              if (role !== Roles.Region) {
                return false;
              }

              return isExposed(element, document, device);
            });
          }),
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
