import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  isElement,
  querySelectorAll
} from "@siteimprove/alfa-dom";
import { hasLanguageAttribute } from "../helpers/has-language-attribute";
import { isDocumentElement } from "../helpers/is-document-element";

export const SIA_R4: Atomic.Rule<Document, Element> = {
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
      expectation(1, hasLanguageAttribute(target));
    });
  }
};
