import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasHeadingLevel } from "../common/predicate/has-heading-level";
import { hasRole } from "../common/predicate/has-role";

const { and, equals } = Predicate;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    const headings = document
      .descendants({ flattened: true })
      .filter(and(isElement, hasRole("heading")));

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
