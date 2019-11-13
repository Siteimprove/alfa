import { Rule } from "@siteimprove/alfa-act";
import { Element, isElement } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasId } from "../common/predicate/has-id";
import { hasUniqueId } from "../common/predicate/has-unique-id";
import { isEmpty } from "../common/predicate/is-empty";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r3.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { composed: true, nested: true }),
          and(isElement, hasId(document, not(isEmpty)))
        );
      },

      expectations(target) {
        return {
          1: test(hasUniqueId(document), target)
            ? Ok.of("The element has a unique ID")
            : Err.of("The element does not have a unique ID")
        };
      }
    };
  }
});
