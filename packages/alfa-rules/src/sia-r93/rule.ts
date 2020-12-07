import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

import { Outcomes } from "../common/diagnostic/text-spacing";
import { expectation } from "../common/expectation";
import { declaresProperty } from "../common/predicate/declares-property";
import { isVisible } from "../common/predicate/is-visible";
import { cascadedIsDeclared } from "../common/expectation/text-spacing";

const { and } = Predicate;
const { isElement, hasNamespace } = Element;

const name = "line-height";
const outcomes = Outcomes(name);

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r93.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ nested: true, flattened: true })
          .filter(
            Refinement.and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                isVisible(device),
                declaresProperty(name)
              )
            )
          );
      },

      expectations(target) {
        const style = Style.from(target, device);
        const computed = style.computed(name);

        return {
          1: expectation(
            computed.source.none((declaration) => declaration.important),
            () => outcomes.notImportant,
            () =>
              expectation(
                (computed.value.type === "number" &&
                  computed.value.value >= 1.5) ||
                  (computed.value.type === "length" &&
                    computed.value.value >=
                      1.5 * style.computed("font-size").value.value),

                () => outcomes.aboveMinimum,
                () =>
                  expectation(
                    !cascadedIsDeclared(device, name)(target),
                    () => outcomes.cascaded,
                    () => outcomes.important
                  )
              )
          ),
        };
      },
    };
  },
});
