import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-block-start": Property.Shorthand<
      | "border-block-start-color"
      | "border-block-start-style"
      | "border-block-start-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start}
 * @internal
 */
export default Property.registerShorthand(
  "border-block-start",
  Property.shorthand(
    [
      "border-block-start-color",
      "border-block-start-style",
      "border-block-start-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-block-start-color", color],
      ["border-block-start-style", style],
      ["border-block-start-width", width],
    ])
);
