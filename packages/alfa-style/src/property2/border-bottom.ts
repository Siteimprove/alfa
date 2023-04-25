import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-bottom": Property.Shorthand<
      "border-bottom-color" | "border-bottom-style" | "border-bottom-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom}
 * @internal
 */
export default Property.registerShorthand(
  "border-bottom",
  Property.shorthand(
    ["border-bottom-color", "border-bottom-style", "border-bottom-width"],
    map(parse, ([color, style, width]) => [
      ["border-bottom-color", color],
      ["border-bottom-style", style],
      ["border-bottom-width", width],
    ])
);
