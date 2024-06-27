import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = Keyword<"normal"> | Length;

type Computed = Length.Canonical;

const parse = either(Keyword.parse("normal"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (value, style) =>
    value.map((spacing) =>
      Selective.of(spacing)
        .if(Length.isLength, (spacing) =>
          spacing.resolve(Resolver.length(style)),
        )
        .else(() => Length.of(0, "px"))
        .get(),
    ),
  {
    inherits: true,
  },
);
