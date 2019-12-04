import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isDecorative } from "../common/predicate/is-decorative";

const { filter } = Iterable;
const { and, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r67.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
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
          1: test(hasAccessibleName(device), target)
            ? Err.of(
                "The image is marked as decorative but has a non-empty accessible name"
              )
            : Ok.of(
                "The image is marked as decorative and has an empty accessible name"
              )
        };
      }
    };
  }
});
