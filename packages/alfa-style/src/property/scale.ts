import { Keyword, ScaleProperty } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

const { either } = Parser;

type Specified = Keyword<"none"> | ScaleProperty;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/scale}
 *
 * @public
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), ScaleProperty.parse),
  (value) => value,
  { inherits: false },
);
