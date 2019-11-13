import { Rule } from "@siteimprove/alfa-act";
import { Document, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasTextContent } from "../common/predicate/has-text-content";
import { isDocumentElement } from "../common/predicate/is-document-element";

import { walk } from "../common/walk";

const { filter, first } = Iterable;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r1.html",
  evaluate({ document }) {
    return {
      applicability() {
        return hasChild(document, and(isElement, isDocumentElement(document)))
          ? [document]
          : [];
      },

      expectations(target) {
        const title = first(
          filter(
            walk(target, document),
            and(
              isElement,
              and(
                hasNamespace(document, equals(Namespace.HTML)),
                hasName(equals("title"))
              )
            )
          )
        );

        return {
          1: title.isSome()
            ? Ok.of("The document has at least one <title> element")
            : Err.of("The document does not have a <title> element"),

          2: title.filter(hasTextContent(document)).isSome()
            ? Ok.of("The first <title> element has text content")
            : Err.of("The first <title> element has no text content")
        };
      }
    };
  }
});
