import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isDecorative } from "../common/predicate/is-decorative";

const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r67.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML)),
                and(hasName(equals("img")), isDecorative)
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasName = Err.of(
    "The image is marked as decorative but has a non-empty accessible name"
  );

  export const HasNoName = Ok.of(
    "The image is marked as decorative and has an empty accessible name"
  );
}
