import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasChild } from "../common/predicate/has-child";
import { hasTextContent } from "../common/predicate/has-text-content";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { isElement, hasName, hasNamespace } = Element;
const { and, fold } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r1.html",
  evaluate({ document }) {
    return {
      applicability() {
        return fold(
          hasChild(isDocumentElement),
          () => [document],
          () => [],
          document
        );
      },

      expectations(target) {
        const title = target
          .descendants()
          .filter(isElement)
          .find(and(hasNamespace(Namespace.HTML), hasName("title")));

        return {
          1: expectation(
            title.isSome(),
            () => Outcomes.HasTitle,
            () => Outcomes.HasNoTitle
          ),

          2: expectation(
            title.some(hasTextContent()),
            () => Outcomes.HasNonEmptyTitle,
            () => Outcomes.HasEmptyTitle
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasTitle = Ok.of(
    Diagnostic.of(`The document has at least one \`<title>\` element`)
  );

  export const HasNoTitle = Err.of(
    Diagnostic.of(`The document does not have a \`<title>\` element`)
  );

  export const HasNonEmptyTitle = Ok.of(
    Diagnostic.of(`The first \`<title>\` element has text content`)
  );

  export const HasEmptyTitle = Err.of(
    Diagnostic.of(`The first \`<title>\` element has no text content`)
  );
}
