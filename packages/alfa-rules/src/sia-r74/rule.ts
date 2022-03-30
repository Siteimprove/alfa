import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Unit } from "@siteimprove/alfa-css";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { hasRole, isVisible } from "../common/predicate";
import { Scope } from "../tags";

const { isElement } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r74",
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
                Style.from(element, device)
                  .cascaded("font-size")
                  .some(({ value: fontSize }) => {
                    switch (fontSize.type) {
                      case "length":
                      case "percentage":
                        return fontSize.value > 0;

                      default:
                        return true;
                    }
                  }),
              Node.hasTextContent(),
              isVisible(device)
            )
          );
      },

      expectations(target) {
        const { value: fontSize } = Style.from(target, device)
          .cascaded("font-size")
          .get();

        return {
          1: expectation(
            fontSize.type !== "length" || Unit.Length.isRelative(fontSize.unit),
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
    Diagnostic.of(`The font size is specified using a relative unit`)
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The font size is specified using an absolute unit`)
  );
}
