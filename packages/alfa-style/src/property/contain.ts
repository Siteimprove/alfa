import { Keyword, ContainFlags } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

const { either } = Parser;

/**
 * {@link
 * https://developer.mozilla.org/en-US/docs/Web/CSS/contain#formal_syntax}
 *
 * @public
 */
type Specified =
  | Keyword<"none">
  | Keyword<"strict">
  | Keyword<"content">
  | ContainFlags;

type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/contain}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none", "strict", "content"), ContainFlags.parse),
  (value) => value,
  { inherits: false },
);
