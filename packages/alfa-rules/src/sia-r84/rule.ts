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

/**
 * Determine if an element is possibly scrollable. This is determined by the
 * following factors:
 *
 * - A computed `width` or `height` that is not `auto`.
 * - A computed `overflow-x` or `overflow-y` that is `auto`, `clip`, or
 *   `scroll`.
 */
function isPossiblyScrollable(device: Device): Predicate<Element> {
  const propertiers = [
    ["overflow-x", "width"],
    ["overflow-y", "height"],
  ] as const;

  return (element) => {
    const style = Style.from(element, device);

    return propertiers.some(
      ([overflow, dimension]) =>
        style
          .computed(dimension)
          .some((dimension) => dimension.value !== "auto") &&
        style.computed(overflow).some((overflow) => {
          switch (overflow.value) {
            case "auto":
            case "clip":
            case "scroll":
              return true;

            default:
              return false;
          }
        })
    );
  };
}
