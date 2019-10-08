import { Atomic } from "@siteimprove/alfa-act";
import { Predicate } from "@siteimprove/alfa-compatibility";
import {
  Document,
  hasTextContent,
  Namespace,
  querySelector
} from "@siteimprove/alfa-dom";

import { isElement, nameIs, namespaceIs } from "../helpers/predicates";

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
          Predicate.from(
            isElement
              .and(namespaceIs(document, Namespace.HTML))
              .and(nameIs("title"))
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

    if (isElement.and(nameIs("html")).test(childNode)) {
      return true;
    }
  }

  return false;
}
