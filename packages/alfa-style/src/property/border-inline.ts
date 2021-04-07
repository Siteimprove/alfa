import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline": Property.Shorthand<
      | "border-inline-start-color"
      | "border-inline-start-style"
      | "border-inline-start-width"
      | "border-inline-end-color"
      | "border-inline-end-style"
      | "border-inline-end-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline",
  Property.shorthand(
    [
      "border-inline-start-color",
      "border-inline-start-style",
      "border-inline-start-width",
      "border-inline-end-color",
      "border-inline-end-style",
      "border-inline-end-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-inline-start-color", color],
      ["border-inline-start-style", style],
      ["border-inline-start-width", width],
      ["border-inline-end-color", color],
      ["border-inline-end-style", style],
      ["border-inline-end-width", width],
    ])
  )
);
