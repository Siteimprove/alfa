import {
  Keyword,
  Length as CSSLength,
  type Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Value } from "../value";
import { Length } from "./value/compound";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length.Length
  | Keyword<"thin">
  | Keyword<"medium">
  | Keyword<"thick">;

/**
 * @internal
 */
export type Computed = CSSLength<"px">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("thin", "medium", "thick"),
  Length.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  CSSLength.of(3, "px"),
  parse,
  (value, style) => {
    if (style.computed("outline-style").some(({ value }) => value === "none")) {
      return Value.of(CSSLength.of(0, "px"));
    }

    return value.map((width) => {
      if (Length.isLength(width)) {
        return Length.resolve(width, style);
      }

      switch (width.value) {
        case "thin":
          return CSSLength.of(1, "px");

        case "medium":
          return CSSLength.of(3, "px");

        case "thick":
          return CSSLength.of(5, "px");
      }
    });
  }
);
