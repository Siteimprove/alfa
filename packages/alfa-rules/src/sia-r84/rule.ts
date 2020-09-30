import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasInclusiveDescendant } from "../common/predicate/has-inclusive-descendant";
import { isVisible } from "../common/predicate/is-visible";
import { isTabbable } from "../common/predicate/is-tabbable";

const { isElement, hasNamespace } = Element;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r84.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              isVisible(device),
              isPossiblyScrollable(device)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasInclusiveDescendant(and(isElement, isTabbable(device)), {
              flattened: true,
            })(target),
            () => Outcomes.IsReachable,
            () => Outcomes.IsNotReachable
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsReachable = Ok.of(
    Diagnostic.of(
      `The scrollable element is reachable through keyboard navigation`
    )
  );

  export const IsNotReachable = Err.of(
    Diagnostic.of(
      `The scrollable element is not reachable through keyboard navigation`
    )
  );
}

function isPossiblyScrollable(device: Device): Predicate<Element> {
  /**
   * Determine if an element is possibly scrollable. This is determined by the
   * following factors:
   *
   * - A computed `width` or `height` that is not `auto`.
   * - A computed `overflow-x` or `overflow-y` that is `auto`, `clip`, or
   *   `scroll`.
   */
  return (element) => {
    const style = Style.from(element, device);

    if (
      style.computed("width").value.type === "keyword" &&
      style.computed("height").value.type === "keyword"
    ) {
      return false;
    }

    for (const property of ["overflow-x", "overflow-y"] as const) {
      const { value: overflow } = style.computed(property);

      switch (overflow.value) {
        case "auto":
        case "clip":
        case "scroll":
          return true;
      }
    }

    return false;
  };
}
