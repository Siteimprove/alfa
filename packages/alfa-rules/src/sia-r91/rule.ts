import { Rule } from "@siteimprove/alfa-act";
import { Declaration, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { textWithInlinedImportantProperty } from "../common/applicability/text-with-inlined-important-property";
import { TextSpacing } from "../common/diagnostic/text-spacing";

import { Scope, Version } from "../tags";

const { test } = Predicate;
const { hasComputedStyle } = Style;

const property = "letter-spacing";
const threshold = 0.12;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r91",
  requirements: [Criterion.of("1.4.12")],
  tags: [Scope.Component, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return textWithInlinedImportantProperty(document, device, property);
      },

      expectations(target) {
        let value: Style.Computed<typeof property>;
        let fontSize: Style.Computed<"font-size">;
        let ratio: number;
        let declaration: Declaration;

        return {
          1: expectation(
            test(
              hasComputedStyle(
                property,
                (propertyValue, source) =>
                  test(
                    hasComputedStyle(
                      "font-size",
                      (fontSizeValue) => {
                        ratio = propertyValue.value / fontSizeValue.value;
                        fontSize = fontSizeValue;
                        value = propertyValue;
                        // The source is guaranteed by the hasSpecifiedStyle
                        // filter in Applicability.
                        declaration = source.getUnsafe();
                        return ratio >= threshold;
                      },
                      device
                    ),
                    target
                  ),
                device
              ),
              target
            ),
            () =>
              Outcomes.IsWideEnough(
                property,
                value,
                fontSize,
                ratio,
                threshold,
                declaration,
                // The owner is guaranteed by the hasSpecifiedStyle
                // filter in Applicability.
                declaration.owner.getUnsafe()
              ),
            () =>
              Outcomes.IsNotWideEnough(
                property,
                value,
                fontSize,
                ratio,
                threshold,
                declaration,
                // The owner is guaranteed by the hasSpecifiedStyle
                // filter in Applicability.
                declaration.owner.getUnsafe()
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsWideEnough = (
    prop: typeof property,
    value: Style.Computed<typeof property>,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ) =>
    Ok.of(
      TextSpacing.of(
        "Good",
        prop,
        value,
        fontSize,
        ratio,
        threshold,
        declaration,
        owner
      )
    );

  export const IsNotWideEnough = (
    prop: typeof property,
    value: Style.Computed<typeof property>,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ) =>
    Err.of(
      TextSpacing.of(
        "Bad",
        prop,
        value,
        fontSize,
        ratio,
        threshold,
        declaration,
        owner
      )
    );
}
