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

const property = "line-height";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r93.html",
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
        const lineHeight = style.computed(property);

        return {
          1: expectation(
            lineHeight.source.none((declaration) => declaration.important),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                lineHeight.some((lineHeight) => {
                  switch (lineHeight.type) {
                    case "number":
                      return lineHeight.value >= 1.5;

                    case "length":
                      return style
                        .computed("font-size")
                        .some(
                          (fontSize) => lineHeight.value >= 1.5 * fontSize.value
                        );

                    default:
                      return false;
                  }
                }),

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
