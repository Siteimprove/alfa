import { Keyword, TrimFlags } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Longhand } from "../longhand.js";
import { isBlockContainer, isInlineBox } from "../predicate/index.js";

const { either } = Parser;
const { or } = Predicate;

/**
 * {@link
 * https://developer.mozilla.org/en-US/docs/Web/CSS/contain#formal_syntax}
 *
 * @public
 */
type Specified = Keyword<"none"> | TrimFlags;

type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/contain}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), TrimFlags.parse),
  (value) => value,
  {
    inherits: false,
    use: (value, style) =>
      Option.conditional(value, (_) =>
        or(isBlockContainer, isInlineBox)(style),
      ),
  },
);
