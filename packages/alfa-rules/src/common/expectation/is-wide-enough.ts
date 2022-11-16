import { Device } from "@siteimprove/alfa-device";
import { Declaration, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { expectation } from "../act/expectation";
import { TextSpacing } from "../diagnostic/text-spacing";

const { test } = Predicate;
const { hasComputedStyle } = Style;

type Name = "letter-spacing" | "word-spacing";

/**
 * @internal
 */
export function isWideEnough(
  target: Element,
  device: Device,
  property: Name,
  threshold: number
) {
  let value: Style.Computed<Name>;
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
                  value = propertyValue;
                  fontSize = fontSizeValue;
                  ratio = propertyValue.value / fontSizeValue.value;
                  // The source is guaranteed to exist by the hasSpecifiedStyle
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
          // The owner is guaranteed to exist by the hasSpecifiedStyle
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
          // The owner is guaranteed to exist by the hasSpecifiedStyle
          // filter in Applicability.
          declaration.owner.getUnsafe()
        )
    ),
  };
}

export namespace Outcomes {
  export const IsWideEnough = (
    prop: Name,
    value: Style.Computed<Name>,
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
    prop: Name,
    value: Style.Computed<Name>,
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
