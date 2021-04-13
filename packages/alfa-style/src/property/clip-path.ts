import { Shape, Keyword, URL } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "clip-path": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = URL | Shape | Keyword<"none">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  URL.parse,
  either(Shape.parse, Keyword.parse("none"))
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path}
 * @internal
 */
export default Property.register(
  "clip-path",
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (value) => value)
);
