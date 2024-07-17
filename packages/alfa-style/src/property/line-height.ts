import {
  Keyword,
  LengthPercentage,
  Number,
  type Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

import type { Computed as FontSize } from "./font-size.js";
import { Selective } from "@siteimprove/alfa-selective";

const { either } = Parser;

type Specified = Keyword<"normal"> | LengthPercentage | Number;

/**
 * @internal
 */
export type Computed =
  | Keyword<"normal">
  | Number.Canonical
  | LengthPercentage.Canonical;

const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("normal"),
  Number.parse,
  LengthPercentage.parse,
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/line-height}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("normal"),
  parse,
  (value, style) =>
    value.map((height) => {
      // We need the type assertion to help TS break a circular type reference:
      // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
      const fontSize = style.computed("font-size").value as FontSize;

      return (
        Selective.of(height)
          .if(
            LengthPercentage.isLengthPercentage,
            LengthPercentage.resolve(
              Resolver.lengthPercentage(fontSize, style),
            ),
          )
          .if(Number.isNumber, (value) => value.resolve())
          // Keywords are left untouched
          .get()
      );
    }),
  {
    inherits: true,
  },
);
