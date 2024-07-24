import { Integer, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

const { either } = Parser;

const parse = either(Keyword.parse("auto"), Integer.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/z-index}
 * @internal
 */
export default Longhand.of(Keyword.of("auto"), parse, (value) => value, {
  inherits: false,
});
