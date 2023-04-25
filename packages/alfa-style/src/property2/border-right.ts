import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-right": Property.Shorthand<
      "border-right-color" | "border-right-style" | "border-right-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right}
 * @internal
 */
export default Property.registerShorthand(
  "border-right",
  Property.shorthand(
    ["border-right-color", "border-right-style", "border-right-width"],
    map(parse, ([color, style, width]) => [
      ["border-right-color", color],
      ["border-right-style", style],
      ["border-right-width", width],
    ])
);
