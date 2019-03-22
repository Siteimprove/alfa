import { Atomic } from "@siteimprove/alfa-act";
import {
  Category,
  getRole,
  getTextAlternative,
  hasNameFrom
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  hasAttribute,
  isElement,
  isRendered,
  isText,
  Namespace,
  Node,
  querySelectorAll,
  traverseNode
} from "@siteimprove/alfa-dom";

export const SIA_R14: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r14.html",
  requirements: [{ id: "wcag:label-in-name", partial: true }],
  evaluate: ({ device, document }) => {
    return {
      applicability: () => {
        return querySelectorAll<Element>(document, document, node => {
          return (
            isElement(node) &&
            isHtmlElement(node, document) &&
            isWidget(node, document, device) &&
            isContentLabelable(node, document, device) &&
            hasVisibleTextContent(node, document, device) &&
            (hasAttribute(node, "aria-label") ||
              hasAttribute(node, "aria-labelledby"))
          );
        }).map(element => {
          return {
            applicable: true,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target) => {
        const visibleTextContent = normalize(
          getVisibleTextContent(target, document, device)
        );

        return {
          1: {
            holds: some(
              getTextAlternative(target, document, device),
              textAlternative =>
                textAlternative !== null &&
                normalize(textAlternative).includes(visibleTextContent)
            )
          }
        };
      }
    };
  }
};

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/, " ");
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
        if (isElement(node) && isRendered(node, context, device)) {
          const { childNodes } = node;

          for (let i = 0, n = childNodes.length; i < n; i++) {
            const childNode = childNodes[i];

            if (isText(childNode)) {
              textContent += childNode.data;
            }
          }
        }
      }
    },
    { flattened: true }
  );

  return textContent;
}

function hasVisibleTextContent(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return getVisibleTextContent(element, context, device).trim() !== "";
}

function isHtmlElement(element: Element, context: Node): boolean {
  return getElementNamespace(element, context) === Namespace.HTML;
}

function isWidget(element: Element, context: Node, device: Device): boolean {
  return some(
    getRole(element, context, device),
    role => role !== null && role.category === Category.Widget
  );
}

function isContentLabelable(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return some(
    getRole(element, context, device),
    role => role !== null && hasNameFrom(role, "contents")
  );
}
