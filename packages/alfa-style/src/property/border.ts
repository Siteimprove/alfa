import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    border: Property.Shorthand<
      | "border-top-color"
      | "border-top-style"
      | "border-top-width"
      | "border-right-color"
      | "border-right-style"
      | "border-right-width"
      | "border-bottom-color"
      | "border-bottom-style"
      | "border-bottom-width"
      | "border-left-color"
      | "border-left-style"
      | "border-left-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border}
 * @internal
 */
export default Property.registerShorthand(
  "border",
  Property.shorthand(
    [
      "border-top-color",
      "border-top-style",
      "border-top-width",
      "border-right-color",
      "border-right-style",
      "border-right-width",
      "border-bottom-color",
      "border-bottom-style",
      "border-bottom-width",
      "border-left-color",
      "border-left-style",
      "border-left-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-top-color", color],
      ["border-top-style", style],
      ["border-top-width", width],
      ["border-right-color", color],
      ["border-right-style", style],
      ["border-right-width", width],
      ["border-bottom-color", color],
      ["border-bottom-style", style],
      ["border-bottom-width", width],
      ["border-left-color", color],
      ["border-left-style", style],
      ["border-left-width", width],
    ])
  )
);
