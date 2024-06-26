import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Value } from "../value.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified =
  | Length
  | Keyword<"thin">
  | Keyword<"medium">
  | Keyword<"thick">;

type Computed = Length.Canonical;

const parse = either(Keyword.parse("thin", "medium", "thick"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(3, "px"),
  parse,
  (value, style) => {
    if (style.computed("outline-style").some(({ value }) => value === "none")) {
      return Value.of(Length.of(0, "px"));
    }

    return value.map((width) => {
      if (Length.isLength(width)) {
        return width.resolve(Resolver.length(style));
      }

      // Must be a Keyword
      switch (width.value) {
        case "thin":
          return Length.of(1, "px");

        case "medium":
          return Length.of(3, "px");

        case "thick":
          return Length.of(5, "px");
      }
    });
  },
);
