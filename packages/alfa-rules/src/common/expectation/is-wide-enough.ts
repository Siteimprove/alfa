import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Declaration, Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";

import { expectation } from "../act/expectation";
import { TextSpacing } from "../diagnostic/text-spacing";

type Name = "letter-spacing" | "line-height" | "word-spacing";
type Computed =
  | Style.Computed<"letter-spacing">
  | Style.Computed<"line-height">
  | Style.Computed<"word-spacing">;

/**
 * @internal
 */
export function isWideEnough<N extends Name>(
  target: Element,
  device: Device,
  property: N,
  threshold: number
) {
  const style = Style.from(target, device);

  const fontSize = style.computed("font-size").value;
  const value = style.computed(property).value as Computed;
  // The source is guaranteed to exist by the hasSpecifiedStyle
  // filter in Applicability.
  const declaration = style.computed(property).source.getUnsafe();

  let ratio: number;
  let used: Length.Fixed<"px">;

  switch (value.type) {
    case "length":
      used = value;
      ratio = value.value / fontSize.value;
      break;
    case "number":
      used = fontSize.scale(value.value);
      ratio = value.value;
      break;
    case "keyword":
      // Used value for font-size of `normal` is 1.2 times font-size.
      used = fontSize.scale(1.2);
      ratio = 1.2;
  }

  return {
    1: expectation(
      ratio >= threshold,
      () =>
        Outcomes.IsWideEnough(
          property,
          used,
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
          used,
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

/**
 * @public
 */
export namespace Outcomes {
  export const IsWideEnough = (
    prop: Name,
    value: Length.Fixed<"px">,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ) =>
    Ok.of(
      TextSpacing.of(
        `${prop} is at least ${threshold} times the font-size`,
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
    value: Length.Fixed<"px">,
    fontSize: Style.Computed<"font-size">,
    ratio: number,
    threshold: number,
    declaration: Declaration,
    owner: Element
  ) =>
    Err.of(
      TextSpacing.of(
        `${prop} is less than ${threshold} times the font-size`,
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
