import { Rule } from "@siteimprove/alfa-act";
import { Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { hasName } from "../common/predicate/has-name";
import { isIgnored } from "../common/predicate/is-ignored";

const { isEmpty } = Iterable;
const { and, not, property } = Predicate;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r57.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Text.isText,
              and(property("data", not(isEmpty)), not(isIgnored(device)))
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            aria.Node.from(target, device).every((node) =>
              node
                .ancestors()
                .some((ancestor) =>
                  ancestor
                    .role()
                    .some((role) => role.inheritsFrom(hasName("landmark")))
                )
            ),
            () => Outcomes.IsIncludedInLandmark,
            () => Outcomes.IsNotIncludedInLandmark
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsIncludedInLandmark = Ok.of(
    "The text is included in a landmark region"
  );

  export const IsNotIncludedInLandmark = Err.of(
    "The text is not included in a landmark region"
  );
}
