import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { isDocumentElement } from "../common/predicate";
import { Scope } from "../tags";

const { isElement, hasName, hasNamespace } = Element;
const { hasChild, hasTextContent } = Node;
const { and, fold } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r1",
  requirements: [
    Criterion.of("2.4.2"),
    Technique.of("G88"),
    Technique.of("H25"),
  ],
  tags: [Scope.Page],
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
