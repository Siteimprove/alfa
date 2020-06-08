import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasInclusiveDescendant } from "../common/predicate/has-inclusive-descendant";
import { isTabbable } from "../common/predicate/is-tabbable";

const { and, not, equals } = Predicate;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r17.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(Element.isElement, hasAttribute("aria-hidden", equals("true")))
          );
      },

      expectations(target) {
        return {
          1: expectation(
            not(
              hasInclusiveDescendant(and(isElement, isTabbable(device)), {
                flattened: true,
              })
            )(target),
            () => Outcomes.IsNotTabbable,
            () => Outcomes.IsTabbable
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotTabbable = Ok.of(
    Diagnostic.of(
      `The element is neither tabbable nor has tabbable descendants`
    )
  );

  export const IsTabbable = Err.of(
    Diagnostic.of(`The element is either tabbable or has tabbable descendants`)
  );
}
