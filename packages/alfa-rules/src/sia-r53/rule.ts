import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { hasHeadingLevel } from "../common/predicate/has-heading-level";
import { hasName } from "../common/predicate/has-name";
import { hasRole } from "../common/predicate/has-role";

const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    // because each heading is compared with the previous one, it is much easier to remember them in reverse order.
    const allHeadings = document
      .descendants({ flattened: true })
      .filter(and(Element.isElement, hasRole(hasName(equals("heading")))))
      .reverse();

    return {
      applicability() {
        return allHeadings.take(allHeadings.size - 1);
      },

      expectations(target) {
        const previousHeading = allHeadings
          .skipUntil(equals(target))
          .rest()
          .first()
          .get();

        return {
          1: expectation(
            hasHeadingLevel(device, (currentLevel) =>
              hasHeadingLevel(
                device,
                (previousLevel) => previousLevel >= currentLevel - 1
              )(previousHeading)
            )(target),
            () => Outcomes.isStructured,
            () => Outcomes.isNotStructured
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const isStructured = Ok.of("This heading is correctly numbered.");

  export const isNotStructured = Err.of("This heading is skipping levels.");
}
