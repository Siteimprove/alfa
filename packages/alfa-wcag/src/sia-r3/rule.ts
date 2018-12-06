import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getId,
  getRootNode,
  isElement,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R3: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r3.html",
  requirements: [{ id: "wcag:parsing", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(document, () =>
      querySelectorAll(
        document,
        document,
        node => isElement(node) && hasId(node, document),
        { composed: true }
      )
    );

    expectations((aspect, target, expectation) => {
      expectation(1, hasUniqueId(target, document));
    });
  }
};

function hasId(element: Element, context: Node): boolean {
  return getId(element) !== null;
}

function hasUniqueId(element: Element, context: Node): boolean {
  const id = getId(element);
  return (
    querySelector(
      getRootNode(element, context),
      context,
      node => isElement(node) && getId(node) === id && node !== element
    ) === null
  );
}
