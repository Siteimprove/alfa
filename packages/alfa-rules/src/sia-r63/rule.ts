import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r63.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(isElement, and(hasNamespace(Namespace.HTML), hasName("object")))
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = Ok.of(
    Diagnostic.of(`The \`<object>\` element has an accessible name`)
  );

  export const HasNoName = Err.of(
    Diagnostic.of(`The \`<object>\` element does not have an accessible name`)
  );
}
