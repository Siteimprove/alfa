import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

import { TextSpacing } from "../common/outcome/text-spacing";

import { expectation } from "../common/expectation";
import { cascadedIsDeclared } from "../common/expectation/text-spacing";

import { hasInlineStyleProperty } from "../common/predicate/has-inline-style-property";
import { isVisible } from "../common/predicate/is-visible";

const { and } = Predicate;
const { isElement, hasNamespace } = Element;

const property = "word-spacing";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r92.html",
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
        const wordSpacing = style.computed(property);

        return {
          1: expectation(
            wordSpacing.source.none((declaration) => declaration.important),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                wordSpacing.some((wordSpacing) =>
                  style
                    .computed("font-size")
                    .some(
                      (fontSize) => wordSpacing.value >= 0.16 * fontSize.value
                    )
                ),
                () => Outcomes.AboveMinimum,
                () =>
                  expectation(
                    !cascadedIsDeclared(device, property)(target),
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
