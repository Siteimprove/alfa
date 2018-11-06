import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getAttribute,
  isElement,
  isFocusable,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R17: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r17.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          getAttribute(node, "aria-hidden", { lowerCase: true }) === "true"
      )
    );

    expectations((target, expectation) => {
      expectation(1, !isFocusable(target, document));
      expectation(2, !hasFocusableDescendants(target, document));
    });
  }
};

function hasFocusableDescendants(element: Element, context: Node): boolean {
  return (
    querySelector(
      element,
      context,
      node => node !== element && isElement(node) && isFocusable(node, context)
    ) !== null
  );
}
