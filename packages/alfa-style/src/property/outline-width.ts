import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Value } from "../value";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length
  | Keyword<"thin">
  | Keyword<"medium">
  | Keyword<"thick">;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("thin", "medium", "thick"),
  Length.parse
);

/**
 * {@link https://drafts.csswg.org/css-ui/#outline-width}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Length.of(3, "px"),
  parse,
  (outlineWidth, style) => {
    if (style.computed("outline-style").some(({ value }) => value === "none")) {
      return Value.of(Length.of(0, "px"));
    }

    return outlineWidth.map((value) => {
      switch (value.type) {
        case "keyword":
          switch (value.value) {
            case "thin":
              return Length.of(1, "px");

            case "medium":
              return Length.of(3, "px");

            case "thick":
              return Length.of(5, "px");
          }

        case "length":
          return Resolver.length(value, style);
      }
    });
  }
);
