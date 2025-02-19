import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.js";
import { BestPractice } from "../requirements/index.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { and, test } = Predicate;
const { isVisible, hasComputedStyle } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r85",
  requirements: [BestPractice.of("paragraph-not-italics")],
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
            test(isNotItalic(device), target),
            () => Outcomes.IsNotItalic,
            () => Outcomes.IsItalic,
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
  export const IsNotItalic = Ok.of(
    Diagnostic.of(`The text of the paragraph is not all italic`),
  );

  export const IsItalic = Err.of(
    Diagnostic.of(`The text of the paragraph is all italic`),
  );
}

function isNotItalic(device: Device) {
  return hasComputedStyle(
    "font-style",
    (style) => style.value !== "italic",
    device,
  );
}
