import { Rule } from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";

const { filter, flatMap } = Iterable;
const { and, equals } = Predicate;

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
            filter(element.attributes, attribute =>
              aria.Attribute.lookup(attribute.name).isSome()
            )
        );
      },

      expectations(target) {
        const attribute = aria.Attribute.lookup(target.name).get();

        return {
          1: attribute.isValid(target.value)
            ? Ok.of("The attribute has a valid value")
            : Err.of("The attribute does not have a valid value")
        };
      }
    };
  }
});
