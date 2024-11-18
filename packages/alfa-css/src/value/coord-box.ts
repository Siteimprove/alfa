import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser } from "../syntax/index.js";

import { Keyword } from "./textual/keyword.js";

const { either } = Parser;

/**
 * @internal
 */
type VisualBox =
  | Keyword<"content-box">
  | Keyword<"padding-box">
  | Keyword<"border-box">;

/**
 * @internal
 */
namespace VisualBox {
  export type JSON =
    | Keyword.JSON<"content-box">
    | Keyword.JSON<"padding-box">
    | Keyword.JSON<"border-box">;

  export const parse: CSSParser<VisualBox> = Keyword.parse(
    "content-box",
    "padding-box",
    "border-box",
  );
}

/**
 * @internal
 */
type PaintBox = VisualBox | Keyword<"fill-box"> | Keyword<"stroke-box">;

/**
 * @internal
 */
namespace PaintBox {
  export type JSON =
    | VisualBox.JSON
    | Keyword.JSON<"fill-box">
    | Keyword.JSON<"stroke-box">;

  export const parse: CSSParser<PaintBox> = either(
    VisualBox.parse,
    Keyword.parse("fill-box", "stroke-box"),
  );
}

/**
 * @public
 */
export type CoordBox = PaintBox | Keyword<"view-box">;

/**
 * @public
 */
export namespace CoordBox {
  export type JSON = PaintBox.JSON | Keyword.JSON<"view-box">;

  export const parse: CSSParser<CoordBox> = either(
    PaintBox.parse,
    Keyword.parse("view-box"),
  );
}
