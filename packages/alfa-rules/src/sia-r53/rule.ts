import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { hasRole, isIgnored } from "../common/predicate";
import { Scope } from "../tags";

const { hasHeadingLevel } = DOM;
const { isElement } = Element;
const { equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r53",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    const headings = document
      .descendants({ flattened: true })
      .filter(isElement)
      .filter(hasRole(device, "heading"))
      .reject(isIgnored(device));

    return {
      applicability() {
        return headings.skip(1);
      },

      expectations(target) {
        const previous = headings.takeUntil(equals(target)).last().get();

        return {
          1: expectation(
            hasHeadingLevel(device, (currentLevel) =>
              hasHeadingLevel(
                device,
                (previousLevel) => previousLevel >= currentLevel - 1
              )(previous)
            )(target),
            () => Outcomes.IsStructured,
            () => Outcomes.IsNotStructured
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsStructured = Ok.of(
    Diagnostic.of(`The heading is correctly ordered`)
  );

  export const IsNotStructured = Err.of(
    Diagnostic.of(`The heading skips one or more levels`)
  );
}
