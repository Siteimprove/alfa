import { Rule } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, isElement, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isTabbable } from "../common/predicate/is-tabbable";

import { walk } from "../common/walk";

const { filter, some } = Iterable;
const { and, not, nor, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r17.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { composed: true, nested: true }),
          and(isElement, hasAttribute(document, "aria-hidden", equals("true")))
        );
      },

      expectations(target) {
        return {
          1: test(
            nor(
              isTabbable(document, device),
              hasTabbableDescendants(document, device)
            ),
            target
          )
            ? Ok.of(
                "The element is neither tabbable nor has tabbable descendants"
              )
            : Err.of(
                "The element is either tabbable or has tabbable descendants"
              )
        };
      }
    };
  }
});

function hasTabbableDescendants(
  context: Node,
  device: Device
): Predicate<Element> {
  return element =>
    some(
      walk(element, document, { flattened: true }),
      and(not(equals(element)), and(isElement, isTabbable(document, device)))
    );
}
