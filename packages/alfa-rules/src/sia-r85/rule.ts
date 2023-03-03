import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { isElement } = Element;
const { and } = Predicate;
const { isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r85",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .elementDescendants(Node.fullTree)
          .filter(and(hasRole(device, "paragraph"), isVisible(device)));
      },

      expectations(target) {
        const { value: style } = Style.from(target, device).computed(
          "font-style"
        );

        return {
          1: expectation(
            style.value !== "italic",
            () => Outcomes.IsNotItalic,
            () => Outcomes.IsItalic
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotItalic = Ok.of(
    Diagnostic.of(`The text of the paragraph is not all italic`)
  );

  export const IsItalic = Err.of(
    Diagnostic.of(`The text of the paragraph is all italic`)
  );
}
