import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasId } from "../common/predicate/has-id";
import { hasUniqueId } from "../common/predicate/has-unique-id";

const { isEmpty } = Iterable;
const { not } = Predicate;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r3.html",
  requirements: [Criterion.of("4.1.1"), Technique.of("H93")],
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .filter(hasId(not(isEmpty)));
      },

      expectations(target) {
        return {
          1: expectation(
            hasUniqueId()(target),
            () => Outcomes.HasUniqueId,
            () => Outcomes.HasNonUniqueId
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasUniqueId = Ok.of(
    Diagnostic.of(`The element has a unique ID`)
  );

  export const HasNonUniqueId = Err.of(
    Diagnostic.of(`The element does not have a unique ID`)
  );
}
