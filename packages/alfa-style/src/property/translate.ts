import { Keyword, Translate } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

const { either } = Parser;

type Specified = Keyword<"none"> | Translate;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/translate}
 *
 * @public
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), Translate.parseProp),
  (value) => value,
  { inherits: false },
);
