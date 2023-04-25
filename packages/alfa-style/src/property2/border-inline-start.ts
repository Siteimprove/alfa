import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline-start": Property.Shorthand<
      | "border-inline-start-color"
      | "border-inline-start-style"
      | "border-inline-start-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline-start",
  Property.shorthand(
    [
      "border-inline-start-color",
      "border-inline-start-style",
      "border-inline-start-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-inline-start-color", color],
      ["border-inline-start-style", style],
      ["border-inline-start-width", width],
    ])
);
