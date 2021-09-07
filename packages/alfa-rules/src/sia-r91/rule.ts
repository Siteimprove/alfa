import { Rule } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Property } from "@siteimprove/alfa-style";

import { TextSpacing } from "../common/outcome/text-spacing";

import { expectation } from "../common/expectation";
import {
  hasCascadedValueDeclaredInInlineStyle,
  hasComputedStyle,
  hasInlineStyleProperty,
  isVisible,
} from "../common/predicate";

const { and } = Predicate;
const { isElement, hasNamespace } = Element;

const property = "letter-spacing";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r91",
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
        return {
          1: expectation(
            !isImportant(device, property)(target),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                isWideEnough(device)(target),
                () => Outcomes.AboveMinimum,
                () =>
                  expectation(
                    hasCascadedValueDeclaredInInlineStyle(
                      device,
                      property
                    )(target),
                    () => Outcomes.Important,
                    () => Outcomes.Cascaded
                  )
              )
          ),
        };
      },
    };
  },
});

export const Outcomes = TextSpacing(property);

function isWideEnough(device: Device): Predicate<Element> {
  return (element) =>
    hasComputedStyle(
      property,
      (letterSpacing) =>
        hasComputedStyle(
          "font-size",
          (fontSize) => letterSpacing.value >= 0.12 * fontSize.value,
          device
        )(element),
      device
    )(element);
}

function isImportant(
  device: Device,
  property: Property.Name
): Predicate<Element> {
  return hasComputedStyle(
    property,
    (_, source) => source.some((declaration) => declaration.important),
    device
  );
}
