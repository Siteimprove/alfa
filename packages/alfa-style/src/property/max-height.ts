import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified =
  | Keyword<"none">
  | Keyword<"fit-content">
  | Keyword<"max-content">
  | Keyword<"min-content">
  | Length
  | Percentage;

type Computed =
  | Keyword<"none">
  | Keyword<"fit-content">
  | Keyword<"max-content">
  | Keyword<"min-content">
  | Length.Canonical
  | Percentage;

const parse = either(
  Keyword.parse("none", "fit-content", "max-content", "min-content"),
  either(Length.parse, Percentage.parse),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/max-height}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (value, style) =>
    value.map((height) => {
      switch (height.type) {
        case "keyword":
        case "percentage":
          return height;

        case "length":
          return height.resolve(Resolver.length(style));
      }
    }),
);
