import { Color, Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = Color | Keyword<"invert">;

type Computed = Color.Canonical | Keyword<"invert">;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("invert"),
  Color.parse,
  (value) =>
    value.map((specified) =>
      Keyword.isKeyword(specified, "invert")
        ? specified
        : Color.partiallyResolve(specified),
    ),
);
