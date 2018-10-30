import { Atomic } from "@siteimprove/alfa-act";
import {
  Category,
  getRole,
  getTextAlternative,
  hasNameFrom
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
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

export const SIA_R14: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r14.html",
  requirements: [{ id: "wcag:label-in-name", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isHtmlElement(node, document) &&
          isWidget(node, document) &&
          isContentLabelable(node, document) &&
          hasVisibleTextContent(node, document) &&
          (hasAttribute(node, "aria-label") ||
            hasAttribute(node, "aria-labelledby"))
      )
    );

    expectations((target, expectation) => {
      const visibleTextContent = normalize(
        getVisibleTextContent(target, document)
      );

      expectation(
        1,
        some(
          getTextAlternative(target, document),
          textAlternative =>
            textAlternative !== null &&
            normalize(textAlternative).includes(visibleTextContent)
        )
      );
    });
  }
};

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/, " ");
}

function getVisibleTextContent(element: Element, context: Node): string {
  let textContent = "";

  traverseNode(
    element,
    context,
    {
      enter(node) {
        if (isElement(node) && isRendered(node, context)) {
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

function hasVisibleTextContent(element: Element, context: Node): boolean {
  return getVisibleTextContent(element, context).trim() !== "";
}

function isHtmlElement(element: Element, context: Node): boolean {
  return getElementNamespace(element, context) === Namespace.HTML;
}

function isWidget(element: Element, context: Node): boolean {
  return some(
    getRole(element, context),
    role => role !== null && role.category === Category.Widget
  );
}

function isContentLabelable(element: Element, context: Node): boolean {
  return some(
    getRole(element, context),
    role => role !== null && hasNameFrom(role, "contents")
  );
}
