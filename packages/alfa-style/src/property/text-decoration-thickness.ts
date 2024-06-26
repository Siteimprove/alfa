import { Keyword, LengthPercentage, type Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = LengthPercentage | Keyword<"auto"> | Keyword<"from-font">;

type Computed =
  | LengthPercentage.Canonical
  | Keyword<"auto">
  | Keyword<"from-font">;

const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("auto", "from-font"),
  LengthPercentage.parse,
);

const longhand: Longhand<Specified, Computed> = Longhand.of(
  Keyword.of("auto"),
  parse,
  (value, style) =>
    value.map((value) =>
      Selective.of(value)
        .if(
          LengthPercentage.isLengthPercentage,
          LengthPercentage.resolve(
            Resolver.lengthPercentage(style.computed("font-size").value, style),
          ),
        )
        .get(),
    ),
);
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness}
 * @internal
 */
export default longhand;
