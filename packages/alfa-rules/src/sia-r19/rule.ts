import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, not, equals, property } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r19.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .filter(hasNamespace(Namespace.HTML, Namespace.SVG))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter(
              and(
                property("name", aria.Attribute.isName),
                property("value", not(isEmpty))
              )
            )
          );
      },

      expectations(target) {
        const { name, value } = target;

        return {
          1: expectation(
            aria.Attribute.isName(name) &&
              isValid(aria.Attribute.of(name, value)),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The attribute does not have a valid value`)
  );
}

function isValid(attribute: aria.Attribute): boolean {
  const { type, value, options } = attribute;

  switch (type) {
    case "true-false":
      return value === "true" || value === "false";

    case "true-false-undefined":
      return value === "true" || value === "false" || value === "undefined";

    case "tristate":
      return value === "true" || value === "false" || value === "mixed";

    case "id-reference":
      return !/\s+/.test(value);

    case "id-reference-list":
      return true;

    case "integer":
      return /^\d+$/.test(value);

    case "number":
      return /^\d+(\.\d+)?$/.test(value);

    case "string":
      return true;

    case "token":
      return value === "undefined" || options.some(equals(value));

    case "token-list":
      return value.split(/\s+/).every((value) => options.some(equals(value)));
  }
}
