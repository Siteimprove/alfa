import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasId } from "../common/predicate/has-id";
import { hasUniqueId } from "../common/predicate/has-unique-id";

const { filter, isEmpty } = Iterable;
const { and, not, fold } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r3.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ composed: true, nested: true }),
          and(Element.isElement, hasId(not(isEmpty)))
        );
      },

      expectations(target) {
        return {
          1: fold(
            hasUniqueId(),
            target,
            () => Outcomes.HasUniqueId,
            () => Outcomes.HasNonUniqueId
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasUniqueId = Some.of(
    Ok.of("The element has a unique ID") as Result<string, string>
  );

  export const HasNonUniqueId = Some.of(
    Err.of("The element does not have a unique ID") as Result<string, string>
  );
}
