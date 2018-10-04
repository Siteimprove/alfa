import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getElementNamespace,
  getId,
  getRootNode,
  isElement,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R3: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r3.html",
  requirements: ["wcag:parsing"],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node => isElement(node) && hasId(node, document),
        { composed: true }
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasUniqueId(target, document));
    });
  }
};

function hasId(element: Element, context: Node): boolean {
  switch (getElementNamespace(element, context)) {
    case Namespace.HTML:
    case Namespace.SVG:
      break;
    default:
      return false;
  }

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
