import { Atomic } from "@siteimprove/alfa-act";
import { getTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export const SIA_R28: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r28.html",
  requirements: [
    { id: "wcag:non-text-content", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(
          document,
          document,
          node => {
            return isElement(node) && isImageButton(node, document);
          },
          {
            composed: true
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
              1: {
                holds: textAlternative !== null && textAlternative !== "",
                data: {
                  alt: textAlternative
                }
              }
            };
          }
        );
      }
    };
  }
};

function isImageButton(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return getInputType(element) === InputType.Image;
}
