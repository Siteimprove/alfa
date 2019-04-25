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

import { EN } from "./locales/en";

const { map } = BrowserSpecific;

export const SIA_R2: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r2.html",
  requirements: [{ id: "wcag:non-text-content", partial: true }],
  locales: [EN],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll(document, document, isElement, {
          flattened: true
        }).map(element => {
          return map(isImage(element, document, device), isImage => {
            if (!isImage) {
              return {
                applicable: false,
                aspect: document,
                target: element
              };
            }

            if (element.localName === "img") {
              return {
                applicable: true,
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
            return map(isDecorative(target, document, device), isDecorative => {
              return {
                1: {
                  holds:
                    isDecorative ||
                    (textAlternative !== null && textAlternative !== ""),
                  data: {
                    alt: textAlternative,
                    decorative: isDecorative
                  }
                }
              };
            });
          }
        );
      }
    };
  }
};

function isImage(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  if (element.localName === "img") {
    return true;
  }

  return map(getRole(element, context, device), role => role === Roles.Img);
}

function isDecorative(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getRole(element, context, device), role => {
    switch (role) {
      case Roles.None:
      case Roles.Presentation:
      case null:
        return true;
    }

    return false;
  });
}
