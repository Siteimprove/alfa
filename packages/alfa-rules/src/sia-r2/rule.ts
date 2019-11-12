import { Rule } from "@siteimprove/alfa-act";
import { Roles } from "@siteimprove/alfa-aria";
import { Element, isElement, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isDecorative } from "../common/predicate/is-decorative";
import { isExposed } from "../common/predicate/is-exposed";

import { walk } from "../common/walk";

const { filter } = Iterable;
const { and, or, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r2.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, Namespace.HTML),
              or(
                hasName("img"),
                and(
                  hasRole(document, device, Roles.Img),
                  isExposed(document, device)
                )
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(
            or(
              isDecorative(document, device),
              hasAccessibleName(document, device)
            ),
            target
          )
            ? Ok.of(
                "The image has an accessible name or is marked as decorative"
              )
            : Err.of(
                "The image neither has an accessible name nor is marked as decorative"
              )
        };
      }
    };
  }
});
