import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-left": Property.Shorthand<
      "border-left-color" | "border-left-style" | "border-left-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right}
 * @internal
 */
export default Property.registerShorthand(
  "border-left",
  Property.shorthand(
    ["border-left-color", "border-left-style", "border-left-width"],
    map(parse, ([color, style, width]) => [
      ["border-left-color", color],
      ["border-left-style", style],
      ["border-left-width", width],
    ])
  )
);
