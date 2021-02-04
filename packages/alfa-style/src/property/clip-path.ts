import { Shape, Keyword, Token, URL } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";

const { either } = Parser;

export namespace ClipPath {
  export type Specified = URL | Shape | Keyword<"none">;

  export type Computed = Specified;
}

/**
 * @see https://drafts.fxtf.org/css-masking/#the-clip-path
 */

export const ClipPath: Property<
  ClipPath.Specified,
  ClipPath.Computed
> = Property.of(
  Keyword.of("none"),
  either<Slice<Token>, ClipPath.Specified, string>(
    URL.parse,
    Shape.parse,
    Keyword.parse("none")
  ),
  (style) => style.specified("clip-path")
);
