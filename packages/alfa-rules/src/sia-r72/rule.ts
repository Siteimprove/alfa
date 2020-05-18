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
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r72.html",
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
        const { value: transform } = Style.from(target, device).computed(
          "text-transform"
        );

        return {
          1: expectation(
            transform.value !== "uppercase",
            () => Outcomes.IsNotUppercased,
            () => Outcomes.IsUppercased
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotUppercased = Ok.of("The paragraph text is not uppercased");

  export const IsUppercased = Err.of("The paragraph text is uppercased");
}
