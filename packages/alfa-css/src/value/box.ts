import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../syntax";

import { Keyword } from "./keyword";

const { either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-backgrounds/#typedef-box}
 *
 * @public
 */
export type Box =
  | Keyword<"border-box">
  | Keyword<"padding-box">
  | Keyword<"content-box">;

/**
 * @public
 */
export namespace Box {
  export type JSON =
    | Keyword.JSON<"border-box">
    | Keyword.JSON<"padding-box">
    | Keyword.JSON<"content-box">;

  export const parse: Parser<Slice<Token>, Box, string> = Keyword.parse(
    "border-box",
    "padding-box",
    "content-box"
  );

  /**
   * {@link https://drafts.csswg.org/css-shapes/#typedef-shape-box}
   */
  export type Shape = Box | Keyword<"margin-box">;

  export namespace Shape {
    export type JSON = Box.JSON | Keyword.JSON<"margin-box">;
  }

  export const parseShape: Parser<Slice<Token>, Shape, string> = either(
    parse,
    Keyword.parse("margin-box")
  );

  /**
   * {@link https://drafts.fxtf.org/css-masking/#typedef-geometry-box}
   */
  export type Geometry =
    | Shape
    | Keyword<"fill-box">
    | Keyword<"stroke-box">
    | Keyword<"view-box">;

  export namespace Geometry {
    export type JSON =
      | Shape.JSON
      | Keyword.JSON<"fill-box">
      | Keyword.JSON<"stroke-box">
      | Keyword.JSON<"view-box">;
  }

  export const parseGeometry: Parser<Slice<Token>, Geometry, string> = either(
    parseShape,
    Keyword.parse("fill-box", "stroke-box", "view-box")
  );
}
