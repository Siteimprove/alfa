import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Element} from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { and, test } = Predicate;
const { isVisible, hasComputedStyle } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r71",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(hasRole(device, "paragraph"), isVisible(device)),
        );
      },

      expectations(target) {
        return {
          1: expectation(
            test(isNotJustified(device), target),
            () => Outcomes.IsNotJustified,
            () => Outcomes.IsJustified,
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const IsNotJustified = Ok.of(
    Diagnostic.of(`The text of the paragraph is not justified`),
  );

  export const IsJustified = Err.of(
    Diagnostic.of(`The text of the paragraph is justified`),
  );
}

function isNotJustified(device: Device) {
  return hasComputedStyle(
    "text-align",
    (align) => align.value !== "justify",
    device,
  );
}
