import { Rule } from "@siteimprove/alfa-act";
import { Document, Element, isElement, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { hasId } from "../common/predicate/has-id";
import { hasUniqueId } from "../common/predicate/has-unique-id";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r3.html",
  evaluate({ document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { composed: true, nested: true }),
          and(isElement, hasId(document))
        );
      },

      expectations(target) {
        return {
          1: {
            holds: test(hasUniqueId(document), target)
          }
        };
      }
    };
  }
});
