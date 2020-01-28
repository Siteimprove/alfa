import { Rule } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isTabbable } from "../common/predicate/is-tabbable";

const { filter, some } = Iterable;
const { and, nor, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r17.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(Element.isElement, hasAttribute("aria-hidden", equals("true")))
        );
      },

      expectations(target) {
        return {
          1: test(
            nor(isTabbable(device), hasTabbableDescendants(device)),
            target
          )
            ? Outcomes.IsNotTabbable
            : Outcomes.IsTabbable
        };
      }
    };
  }
});

function hasTabbableDescendants(device: Device): Predicate<Element> {
  return element =>
    some(
      element.descendants({ flattened: true }),
      and(Element.isElement, isTabbable(device))
    );
}

export namespace Outcomes {
  export const IsNotTabbable = Some.of(
    Ok.of(
      "The element is neither tabbable nor has tabbable descendants"
    ) as Result<string, string>
  );

  export const IsTabbable = Some.of(
    Err.of(
      "The element is either tabbable or has tabbable descendants"
    ) as Result<string, string>
  );
}
