import { Keyword, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Percentage

  // Absolute
  | Keyword<"ultra-condensed">
  | Keyword<"extra-condensed">
  | Keyword<"condensed">
  | Keyword<"semi-condensed">
  | Keyword<"normal">
  | Keyword<"semi-expanded">
  | Keyword<"expanded">
  | Keyword<"extra-expanded">
  | Keyword<"ultra-expanded">;

type Computed = Percentage;

/**
 * @internal
 */
export const parseAbsolute = Keyword.parse(
  "ultra-condensed",
  "extra-condensed",
  "condensed",
  "semi-condensed",
  "normal",
  "semi-expanded",
  "expanded",
  "extra-expanded",
  "ultra-expanded"
);

const parse = either(Percentage.parse, parseAbsolute);

/**
 * {@link https://drafts.csswg.org/css-fonts/#font-stretch-prop}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Percentage.of(1),
  parse,
  (fontStretch) =>
    fontStretch.map((fontStretch) => {
      if (fontStretch.type === "percentage") {
        return fontStretch;
      }

      switch (fontStretch.value) {
        case "ultra-condensed":
          return Percentage.of(0.5);

        case "extra-condensed":
          return Percentage.of(0.625);

        case "condensed":
          return Percentage.of(0.75);

        case "semi-condensed":
          return Percentage.of(0.875);

        case "normal":
          return Percentage.of(1);

        case "semi-expanded":
          return Percentage.of(1.125);

        case "expanded":
          return Percentage.of(1.25);

        case "extra-expanded":
          return Percentage.of(1.5);

        case "ultra-expanded":
          return Percentage.of(2);
      }
    }),
  {
    inherits: true,
  }
);
