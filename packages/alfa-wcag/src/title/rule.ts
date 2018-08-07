import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  getElementNamespace,
  hasTextContent,
  isElement,
  Namespace,
  querySelector
} from "@siteimprove/alfa-dom";

export const Title: Rule<"document", Element> = {
  id: "alfa:wcag:title",
  definition: (applicability, expectations, { document }) => {
    applicability(() => querySelector(document, document, "html"));

    expectations((target, expectation) => {
      const title = querySelector(
        target,
        document,
        node =>
          isElement(node) &&
          node.localName === "title" &&
          getElementNamespace(node, document) === Namespace.HTML
      ) as Element | null;

      expectation(1, title !== null);

      if (title !== null) {
        expectation(2, hasTextContent(title, document));
      }
    });
  }
};
