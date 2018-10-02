import { Atomic } from "@siteimprove/alfa-act";
import {
  Element,
  getAttribute,
  getElementNamespace,
  getParentNode,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R4: Atomic.Rule<"document", Element> = {
  id: "sanshikan:rules/sia-r4.html",
  requirements: ["wcag:language-of-page"],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node => isElement(node) && isDocumentElement(node, document),
        { composed: true }
      )
    );

    expectations((target, expectation) => {
      const lang = getAttribute(target, "lang", { trim: true });
      const xmlLang = getAttribute(target, "xml:lang", { trim: true });

      const hasLang = lang !== null && lang !== "";
      const hasXmlLang = xmlLang !== null && lang !== "";

      expectation(1, hasLang || hasXmlLang);
    });
  }
};

function isDocumentElement(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return (
    element.localName === "html" && getParentNode(element, context) === context
  );
}
