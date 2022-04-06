import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { hasNamespace, isDocumentElement, isElement } = Element;
const { and, test } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r59",
  tags: [Scope.Page],
  evaluate({ device, document }) {
    return {
      applicability() {
        return test(Node.hasChild(isDocumentElement), document)
          ? [document]
          : [];
      },

      expectations(target) {
        const hasHeadings = target
          .descendants({ flattened: true })
          .filter(isElement)
          .some(and(hasNamespace(Namespace.HTML), hasRole(device, "heading")));

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
    Diagnostic.of(`The document has at least one heading element`)
  );

  export const HasNoHeadings = Err.of(
    Diagnostic.of(`The document does not have a heading element`)
  );
}
