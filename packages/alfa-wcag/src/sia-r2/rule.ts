import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isVisible,
  Roles
} from "@siteimprove/alfa-aria";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R2: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r2.html",
  requirements: [{ id: "wcag:non-text-content", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node =>
          isElement(node) &&
          isImage(node, document) &&
          isVisible(node, document),
        { composed: true }
      )
    );

    expectations((target, expectation) => {
      expectation(
        1,
        hasTextAlternative(target, document) || isDecorative(target, document)
      );
    });
  }
};

function isImage(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return element.localName === "img" || getRole(element, context) === Roles.Img;
}

function isDecorative(element: Element, context: Node): boolean {
  switch (getRole(element, context)) {
    case Roles.None:
    case Roles.Presentation:
    case null:
      return true;
  }

  return false;
}
