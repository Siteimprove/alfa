import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

import { TextSpacing } from "../common/outcome/text-spacing";

import { expectation } from "../common/expectation";
import { hasCascadedValueDeclaredInInlineStyle } from "../common/predicate/has-cascaded-value-declared-in-inline-style";

import { hasInlineStyleProperty } from "../common/predicate/has-inline-style-property";
import { isVisible } from "../common/predicate/is-visible";

const { and } = Predicate;
const { isElement, hasNamespace } = Element;

const property = "letter-spacing";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r91.html",
  requirements: [Criterion.of("1.4.12")],
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
                hasInlineStyleProperty(property)
              )
            )
          );
      },

      expectations(target) {
        const style = Style.from(target, device);
        const letterSpacing = style.computed(property);

        return {
          1: expectation(
            letterSpacing.source.none((declaration) => declaration.important),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                letterSpacing.some((letterSpacing) =>
                  style
                    .computed("font-size")
                    .some(
                      (fontSize) => letterSpacing.value >= 0.12 * fontSize.value
                    )
                ),
                () => Outcomes.AboveMinimum,
                () =>
                  expectation(
                    !hasCascadedValueDeclaredInInlineStyle(
                      device,
                      property
                    )(target),
                    () => Outcomes.Cascaded,
                    () => Outcomes.Important
                  )
              )
          ),
        };
      },
    };
  },
});

export const Outcomes = TextSpacing(property);
