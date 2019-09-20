import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  hasTextContent,
  Namespace,
  querySelector
} from "@siteimprove/alfa-dom";
import { isElement } from "../helpers/predicate-builder";

export const SIA_R1: Atomic.Rule<Document, Document> = {
  id: "sanshikan:rules/sia-r1.html",
  requirements: [
    { requirement: "wcag", criterion: "page-titled", partial: true }
  ],
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return hasDocumentElement(document)
          ? [{ applicable: true, aspect: document, target: document }]
          : [];
      },

      expectations: (aspect, target) => {
        const title = querySelector(
          target,
          document,
          isElement(builder =>
            builder.withNamespace(document, Namespace.HTML).withName("title")
          )
        );

        return {
          1: { holds: title !== null },
          2: { holds: title !== null && hasTextContent(title, document) }
        };
      }
    };
  }
};

function hasDocumentElement(document: Document): boolean {
  const { childNodes } = document;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (isElement(builder => builder.withName("html"))(childNode)) {
      return true;
    }
  }

  return false;
}
