import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { isIgnored } from "../common/predicate";
import { expectation } from "../common/expectation";

const { and, not } = Predicate;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r54",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(not(isIgnored(device)), (element) =>
              Node.from(element, device)
                .attribute("aria-live")
                .some((attribute) => attribute.value === "assertive")
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device)
              .attribute("aria-atomic")
              .some((attribute) => attribute.value === "true"),
            () => Outcomes.IsAtomic,
            () => Outcomes.IsNotAtomic
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsAtomic = Ok.of(
    Diagnostic.of("The assertive region is atomic")
  );

  export const IsNotAtomic = Err.of(
    Diagnostic.of("The assertive region is not atomic")
  );
}
