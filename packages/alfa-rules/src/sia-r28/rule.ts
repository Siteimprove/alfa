import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { hasAccessibleName, isIgnored } from "../common/predicate";

const { isElement, hasInputType, hasNamespace } = Element;
const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r28",
  requirements: [
    Criterion.of("1.1.1"),
    Criterion.of("4.1.2"),
    Technique.of("G94"),
    Technique.of("G95"),
  ],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasInputType("image"),
              not(isIgnored(device))
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            test(
              // Rejecting default name
              hasAccessibleName(device, (name) => name.source.length !== 0),
              target
            ),
            () => Outcomes.HasAccessibleName,
            () => Outcomes.HasNoAccessibleName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasAccessibleName = Ok.of(
    Diagnostic.of(`The \`<input type="image">\` element has an accessible name`)
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(
      `The \`<input type="image">\` element does not have an accessible name`
    )
  );
}
