import { Shape, Keyword, URL } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

const { either } = Parser;

type Specified = URL | Shape | Keyword<"none">;

type Computed = Specified;

const parse = either(URL.parse, either(Shape.parse, Keyword.parse("none")));

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (value) => value
);
