import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser } from "../syntax/index.js";

import { Keyword } from "./textual/keyword.js";

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

  export const parse: CSSParser<Box> = Keyword.parse(
    "border-box",
    "padding-box",
    "content-box",
  );

  /**
   * {@link https://drafts.csswg.org/css-shapes/#typedef-shape-box}
   */
  export type Shape = Box | Keyword<"margin-box">;

  export namespace Shape {
    export type JSON = Box.JSON | Keyword.JSON<"margin-box">;
  }

  export const parseShape: CSSParser<Shape> = either(
    parse,
    Keyword.parse("margin-box"),
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

  export const parseGeometry: CSSParser<Geometry> = either(
    parseShape,
    Keyword.parse("fill-box", "stroke-box", "view-box"),
  );

  /**
   * {@link https://www.w3.org/TR/css-box-4/#typedef-visual-box}
   */
  export type VisualBox =
    | Keyword<"content-box">
    | Keyword<"padding-box">
    | Keyword<"border-box">;

  namespace VisualBox {
    export type JSON =
      | Keyword.JSON<"content-box">
      | Keyword.JSON<"padding-box">
      | Keyword.JSON<"border-box">;
  }

  export const parseVisualBox: CSSParser<VisualBox> = Keyword.parse(
    "content-box",
    "padding-box",
    "border-box",
  );

  /**
   * {@link https://www.w3.org/TR/css-box-4/#typedef-paint-box}
   */
  export type PaintBox =
    | VisualBox
    | Keyword<"fill-box">
    | Keyword<"stroke-box">;

  namespace PaintBox {
    export type JSON =
      | VisualBox.JSON
      | Keyword.JSON<"fill-box">
      | Keyword.JSON<"stroke-box">;
  }

  export const parsePaintBox: CSSParser<PaintBox> = either(
    parseVisualBox,
    Keyword.parse("fill-box", "stroke-box"),
  );

  /**
   * {@link https://www.w3.org/TR/css-box-4/#typedef-coord-box}
   */
  export type CoordBox = PaintBox | Keyword<"view-box">;

  export namespace CoordBox {
    export type JSON = PaintBox.JSON | Keyword.JSON<"view-box">;
  }

  export const parseCoordBox: CSSParser<CoordBox> = either(
    parsePaintBox,
    Keyword.parse("view-box"),
  );
}
