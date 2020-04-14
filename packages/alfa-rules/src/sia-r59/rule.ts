import { Rule } from "@siteimprove/alfa-act";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { some } = Iterable;
const { and, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r59.html",
  evaluate({ document }) {
    return {
      applicability() {
        return test(hasChild(isDocumentElement), document) ? [document] : [];
      },

      expectations(target) {
        const hasHeadings = some(
          target.descendants({ flattened: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML)),
              hasRole(hasName(equals("heading")))
            )
          )
        );

        return {
          1: expectation(
            hasHeadings,
            () => Outcomes.HasOneHeading,
            () => Outcomes.HasNoHeadings
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasOneHeading = Ok.of(
    "The document has at least one heading element"
  );

  export const HasNoHeadings = Err.of(
    "The document does not have a heading element"
  );
}
