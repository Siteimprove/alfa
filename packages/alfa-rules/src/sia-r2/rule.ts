import { Atomic } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
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

export const SIA_R2: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r2.html",
  requirements: [
    { requirement: "wcag", criterion: "non-text-content", partial: true }
  ],
  locales: [EN],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll(document, document, isElement, {
              flattened: true
            }),
            element => {
              return map(isImage(element, document, device), isImage => {
                if (!isImage) {
                  return false;
                }

                if (element.localName === "img") {
                  return true;
                }

                return isExposed(element, document, device);
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
          hasTextAlternative(target, document, device),
          hasTextAlternative => {
            return map(
              getTextAlternative(target, document, device),
              textAlternative => {
                return map(
                  isDecorative(target, document, device),
                  isDecorative => {
                    return {
                      1: {
                        holds: isDecorative || hasTextAlternative,
                        data: {
                          alt: textAlternative,
                          decorative: isDecorative
                        }
                      }
                    };
                  }
                );
              }
            );
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
  const imgByName = new ElementChecker()
    .withName("img")
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .evaluate(element) as boolean;
  const imgByRole = new ElementChecker()
    .withContext(context)
    .withNamespace(Namespace.HTML)
    .withRole(device, Roles.Img)
    .evaluate(element);

  return imgByName ? imgByName : imgByRole;
}

function isDecorative(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return new ElementChecker()
    .withContext(context)
    .withRole(device, null, Roles.None, Roles.Presentation)
    .evaluate(element);
}
