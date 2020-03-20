import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { hasNamespace } from "../common/predicate/has-namespace";

const { isEmpty } = Iterable;
const { and, not, equals, property } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r19.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(
            and(
              Element.isElement,
              hasNamespace(equals(Namespace.HTML, Namespace.SVG))
            )
          )
          .flatMap(element =>
            Sequence.from(element.attributes).filter(
              and(
                property("name", name => aria.Attribute.lookup(name).isSome()),
                property("value", not(isEmpty))
              )
            )
          );
      },

      expectations(target) {
        const attribute = aria.Attribute.lookup(target.name).get();

        return {
          1: expectation(
            attribute.isValid(target.value),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasValidValue = Ok.of("The attribute has a valid value");

  export const HasNoValidValue = Err.of(
    "The attribute does not have a valid value"
  );
}
