import { Percentage, RGB } from "@siteimprove/alfa-css";
import type { Result } from "@siteimprove/alfa-result";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Contrast } from "../../dist/common/diagnostic/contrast.js";
import { ElementDistinguishable } from "../../dist/sia-r62/diagnostics.js";

export function addCursor(
  style: Result<ElementDistinguishable>,
): Result<ElementDistinguishable> {
  return (style.isErr() ? Ok.of(style.getErr()) : style).map((props) =>
    props
      .withStyle(["cursor", "pointer"])
      .withDistinguishingProperties(["cursor"]),
  );
}
export function addOutline(
  style: Result<ElementDistinguishable>,
): Result<ElementDistinguishable> {
  return (style.isErr() ? Ok.of(style.getErr()) : style).map((props) =>
    props
      .withStyle(["outline", "auto"])
      .withDistinguishingProperties(["outline"]),
  );
}

export function makePairing(
  container: RGB,
  link: RGB,
  contrast: number,
): Contrast.Pairing<["container", "link"]> {
  return Contrast.Pairing.of<["container", "link"]>(
    ["container", container],
    ["link", link],
    contrast,
  );
}
export namespace Defaults {
  // default styling of links
  // The initial value of border-top is medium, resolving as 3px. However, when
  // computing and border-style is none, this is computed as 0px.
  // As a consequence, even without changing `border` at all, the computed value
  // of border-top is not equal to its initial value and needs to expressed here!
  //
  // Confused? Wait, same joke happens for outline-width except that now on focus
  // outline-style is not none, so the computed value of outline-width is its
  // initial value. As a consequence, we cannot just override properties since
  // in this case we need to actually *remove* outline-width from the diagnostic!

  export const defaultLinkColor = RGB.of(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0.9333333),
    Percentage.of(1),
  );

  export const defaultTextColor = RGB.of(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(1),
  );

  export const defaultContrastPairings = [
    makePairing(defaultTextColor, defaultLinkColor, 2.23),
  ];

  export const noDistinguishingProperties = ElementDistinguishable.of(
    [],
    [
      ["border-width", "0px"],
      ["font", "16px serif"],
      ["color", "rgb(0% 0% 93.33333%)"],
      ["outline", "0px"],
    ],
    defaultContrastPairings,
  );

  export const linkProperties = noDistinguishingProperties
    .withStyle(["text-decoration", "underline"])
    .withDistinguishingProperties(["text-decoration"]);

  export const defaultStyle = Ok.of(linkProperties);
  export const hoverStyle = addCursor(defaultStyle);
  export const focusStyle = addOutline(defaultStyle);

  export const noStyle = Err.of(noDistinguishingProperties);
}
