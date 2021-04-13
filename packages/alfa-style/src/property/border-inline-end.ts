import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline-end": Property.Shorthand<
      | "border-inline-end-color"
      | "border-inline-end-style"
      | "border-inline-end-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline-end",
  Property.shorthand(
    [
      "border-inline-end-color",
      "border-inline-end-style",
      "border-inline-end-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-inline-end-color", color],
      ["border-inline-end-style", style],
      ["border-inline-end-width", width],
    ])
  )
);
