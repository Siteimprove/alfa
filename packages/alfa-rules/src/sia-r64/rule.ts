import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import {
  hasNonEmptyAccessibleName,
  hasRole,
  isIgnored,
} from "../common/predicate";
import { Scope } from "../tags/scope";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r64",
  requirements: [
    Criterion.of("1.3.1"),
    Criterion.of("2.4.6"),
    Technique.of("H42"),
  ],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(device, "heading"),
              not(isIgnored(device))
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
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
    Diagnostic.of(`The heading has an accessible name`)
  );

  export const HasNoAccessibleName = Err.of(
    Diagnostic.of(`The heading does not have an accessible name`)
  );
}
