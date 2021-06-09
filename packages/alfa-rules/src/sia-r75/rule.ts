import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasTextContent } from "../common/predicate/has-text-content";
import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r75",
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
              and(hasNamespace(Namespace.HTML), (element) =>
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
                  })
              ),
              and(hasTextContent(), isVisible(device))
            )
          );
      },

      expectations(target) {
        const { value: fontSize } = Style.from(target, device).computed(
          "font-size"
        );

        return {
          1: expectation(
            fontSize.value >= 9,
            () => Outcomes.IsSufficient,
            () => Outcomes.IsInsufficient
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsSufficient = Ok.of(
    Diagnostic.of(`The font size is not smaller than 9 pixels`)
  );

  export const IsInsufficient = Err.of(
    Diagnostic.of(`The font size is smaller than 9 pixels`)
  );
}
