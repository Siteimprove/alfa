import { Integer, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

const parse = either(Keyword.parse("auto"), Integer.parse);

type Specified = Keyword<"auto"> | Integer;
type Computed = Keyword<"auto"> | Integer.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/z-index}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value, style) =>
    value.map((zIndex) => zIndex.resolve(Resolver.length(style))),
  { inherits: false },
);
