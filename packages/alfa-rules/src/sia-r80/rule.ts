import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Unit } from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole } = DOM;
const { isElement } = Element;
const { and } = Predicate;
const { isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r80",
  requirements: [Criterion.of("1.4.8")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(isElement)
          .filter(
            and(
              hasRole(device, "paragraph"),
              (element) =>
                Style.from(element, device).cascaded("line-height").isSome(),
              Node.hasTextContent(),
              isVisible(device)
            )
          );
      },

      expectations(target) {
        const { value: lineHeight } = Style.from(target, device)
          .cascaded("line-height")
          .get();

        return {
          1: expectation(
            lineHeight.type !== "length" ||
              Unit.Length.isRelative(lineHeight.unit),
            () => Outcomes.HasRelativeUnit,
            () => Outcomes.HasAbsoluteUnit
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasRelativeUnit = Ok.of(
    Diagnostic.of(`The line height is specified using a relative unit`)
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The line height is specified using an absolute unit`)
  );
}
