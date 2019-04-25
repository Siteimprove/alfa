import { Atomic } from "@siteimprove/alfa-act";
import {
  Category,
  getRole,
  getTextAlternative,
  hasNameFrom
} from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  hasAttribute,
  isElement,
  isText,
  isVisible,
  Namespace,
  Node,
  querySelectorAll,
  traverseNode
} from "@siteimprove/alfa-dom";

const {
  map,
  Iterable: { filter }
} = BrowserSpecific;

export const SIA_R14: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r14.html",
  requirements: [{ id: "wcag:label-in-name", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return map(
          filter(
            querySelectorAll<Element>(document, document, node => {
              return (
                isElement(node) &&
                isHtmlElement(node, document) &&
                hasVisibleTextContent(node, document, device) &&
                (hasAttribute(node, "aria-label") ||
                  hasAttribute(node, "aria-labelledby"))
              );
            }),
            element => {
              return map(isWidget(element, document, device), isWidget => {
                if (!isWidget) {
                  return false;
                }

                return isContentLabelable(element, document, device);
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
        const visibleTextContent = getVisibleTextContent(
          target,
          document,
          device
        );

        return map(
          getTextAlternative(target, document, device),
          textAlternative => {
            return {
              1: {
                holds:
                  textAlternative !== null &&
                  normalize(textAlternative).includes(visibleTextContent)
              }
            };
          }
        );
      }
    };
  }
};

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getVisibleTextContent(
  element: Element,
  context: Node,
  device: Device
): string {
  let textContent = "";

  traverseNode(
    element,
    context,
    {
      enter(node) {
        if (isText(node) && isVisible(node, context, device)) {
          textContent += node.data;
        }
      }
    },
    {
      flattened: true
    }
  );

  return normalize(textContent);
}

function hasVisibleTextContent(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return getVisibleTextContent(element, context, device) !== "";
}

function isHtmlElement(element: Element, context: Node): boolean {
  return getElementNamespace(element, context) === Namespace.HTML;
}

function isWidget(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(
    getRole(element, context, device),
    role => role !== null && role.category === Category.Widget
  );
}

function isContentLabelable(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(
    getRole(element, context, device),
    role => role !== null && hasNameFrom(role, "contents")
  );
}
