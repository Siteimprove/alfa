import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { getAriaLevel } from "../common/expectation/get-aria-level";
import { hasName } from "../common/predicate/has-name";
import { hasRole } from "../common/predicate/has-role";
import equals = Predicate.equals;

const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    let allHeadings: Sequence<Element>;

    return {
      applicability() {
        // because each heading is compared with the previous one, it is much easier to remember them in reverse order.
        allHeadings = document
          .descendants({ flattened: true })
          .filter(and(Element.isElement, hasRole(hasName(equals("heading")))))
          .reverse();

        return allHeadings.take(allHeadings.size - 1);
      },

      expectations(target) {
        const thisAriaLevel = getAriaLevel(target, device);
        const previousAriaLevel = getAriaLevel(
          allHeadings.skipUntil(equals(target)).rest().first().get(),
          device
        );

        return {
          1: expectation(
            thisAriaLevel.every((thisLevel) =>
              previousAriaLevel.every(
                (previousLevel) => previousLevel >= thisLevel - 1
              )
            ),
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
