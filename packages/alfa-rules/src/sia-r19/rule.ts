import { Rule } from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";

import { walk } from "../common/walk";

const { filter, flatMap } = Iterable;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r19.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return flatMap(
          filter(
            walk(document, document, { composed: true, nested: true }),
            and(
              isElement,
              hasNamespace(document, equals(Namespace.HTML, Namespace.SVG))
            )
          ),
          element =>
            filter(Iterable.from(element.attributes), attribute =>
              aria.Attribute.lookup(attribute.localName).isSome()
            )
        );
      },

      expectations(target) {
        const attribute = aria.Attribute.lookup(target.localName).get();

        return {
          1: attribute.isValid(target.value)
            ? Ok.of("The attribute has a valid value")
            : Err.of("The attribute does not have a valid value")
        };
      }
    };
  }
});
