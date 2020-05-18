import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r71.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(
            and(
              isElement,
              and(hasNamespace(Namespace.HTML), hasName("p"), isVisible(device))
            )
          );
      },

      expectations(target) {
        const { value: align } = Style.from(target, device).computed(
          "text-align"
        );

        return {
          1: expectation(
            align.value !== "justify",
            () => Outcomes.IsNotJustified,
            () => Outcomes.IsJustified
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotJustified = Ok.of("The paragraph text is not justified");

  export const IsJustified = Err.of("The paragraph text is justified");
}
