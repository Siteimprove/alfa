import { Parser } from "@siteimprove/alfa-parser";

import { Keyword } from "./keyword";

const { either } = Parser;

/**
 * @see https://drafts.csswg.org/css-backgrounds/#typedef-box
 */
export type Box =
  | Keyword<"border-box">
  | Keyword<"padding-box">
  | Keyword<"content-box">;

export namespace Box {
  export type JSON = Keyword.JSON<"border-box" | "padding-box" | "content-box">;

  export const parse = Keyword.parse(
    "border-box",
    "padding-box",
    "content-box"
  );

  /**
   * @see https://drafts.csswg.org/css-shapes/#typedef-shape-box
   */
  export type Shape = Box | Keyword<"margin-box">;

  export namespace Shape {
    export type JSON = Box.JSON | Keyword.JSON<"margin-box">;
  }

  export const parseShape = either(parse, Keyword.parse("margin-box"));

  /**
   * @see https://drafts.fxtf.org/css-masking/#typedef-geometry-box
   */
  export type Geometry =
    | Shape
    | Keyword<"fill-box">
    | Keyword<"stroke-box">
    | Keyword<"view-box">;

  export namespace Geometry {
    export type JSON =
      | Shape.JSON
      | Keyword.JSON<"fill-box" | "stroke-box" | "view-box">;
  }

  export const parseGeometry = either(
    parseShape,
    Keyword.parse("fill-box", "stroke-box", "view-box")
  );
}
