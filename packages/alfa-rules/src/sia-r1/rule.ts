import { Rule } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  hasName,
  hasNamespace,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasChild } from "../common/predicate/has-child";
import { hasTextContent } from "../common/predicate/has-text-content";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { filter, first } = Iterable;
const { and, equals, fold } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r1.html",
  evaluate({ document }) {
    return {
      applicability() {
        return fold(
          hasChild(and(Element.isElement, isDocumentElement())),
          document,
          () => [document],
          () => []
        );
      },

      expectations(target) {
        const title = first(
          filter(
            target.descendants(),
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML)),
                hasName(equals("title"))
              )
            )
          )
        );

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
    "The document has at least one <title> element"
  );

  export const HasNoTitle = Err.of(
    "The document does not have a <title> element"
  );

  export const HasNonEmptyTitle = Ok.of(
    "The first <title> element has text content"
  );

  export const HasEmptyTitle = Err.of(
    "The first <title> element has no text content"
  );
}
