import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasNamespace, isBrowsingContextContainer, isElement } = Element;
const { not } = Predicate;
const { and } = Refinement;
const { isTabbable, isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r84",
  requirements: [
    Criterion.of("2.1.1"),
    Criterion.of("2.1.3"),
    Technique.of("G202"),
  ],
  tags: [Scope.Component],
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
              isPossiblyScrollable(device),
              not(isBrowsingContextContainer)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.hasInclusiveDescendant(and(isElement, isTabbable(device)), {
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
 * - A computed `width` or `height` that is not `auto`; and
 * - A corresponding computed `overflow-x` or `overflow-y`, respectively, that
 *   is `auto` or `scroll`.
 */
function isPossiblyScrollable(device: Device): Predicate<Element> {
  const properties = [
    ["x", "width"],
    ["y", "height"],
  ] as const;

  return (element) => {
    const style = Style.from(element, device);

    return properties.some(
      ([axis, dimension]) =>
        style
          .computed(dimension)
          .some((dimension) => dimension.value !== "auto") &&
        style.computed(`overflow-${axis}` as const).some((overflow) => {
          switch (overflow.value) {
            case "auto":
            case "scroll":
              // For the x-axis, the content is likely only scrollable if
              // `white-space: nowrap` is used. Otherwise, the content is likely
              // to instead break along the y-axis.
              if (axis === "x") {
                return style
                  .computed("white-space")
                  .some((whitespace) => whitespace.value === "nowrap");
              }

              return true;

            default:
              return false;
          }
        })
    );
  };
}
