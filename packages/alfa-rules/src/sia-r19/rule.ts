import { Rule } from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";

const { filter, flatMap, isEmpty } = Iterable;
const { and, not, equals, property } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r19.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return flatMap(
          filter(
            document.descendants({ composed: true, nested: true }),
            and(
              Element.isElement,
              hasNamespace(equals(Namespace.HTML, Namespace.SVG))
            )
          ),
          element =>
            filter(
              element.attributes,
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
          1: attribute.isValid(target.value)
            ? Outcomes.HasValidValue
            : Outcomes.HasNoValidValue
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasValidValue = Some.of(
    Ok.of("The attribute has a valid value") as Result<string, string>
  );

  export const HasNoValidValue = Some.of(
    Err.of("The attribute does not have a valid value") as Result<
      string,
      string
    >
  );
}
