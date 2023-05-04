import { Keyword, Length as CSSLength } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand";
import { Length } from "./value/compound";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | Length.Length;

/**
 * @internal
 */
export type Computed = CSSLength<"px">;

/**
 * @internal
 */
export const parse = either(Keyword.parse("normal"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  CSSLength.of(0, "px"),
  parse,
  (value, style) =>
    value.map((spacing) =>
      Selective.of(spacing)
        .if(Length.isLength, Length.resolve(style))
        .else(() => CSSLength.of(0, "px"))
        .get()
    ),
  {
    inherits: true,
  }
);
