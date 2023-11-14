import { type Parser as CSSParser } from "../../syntax";

import { Keyword } from "../keyword";

/**
 * {@link https://drafts.csswg.org/css-color/#css-system-colors}
 *
 * @public
 */
export type System = Keyword<System.Keyword>;

/**
 * @public
 */
export namespace System {
  export type Keyword =
    | "canvas"
    | "canvastext"
    | "linktext"
    | "visitedtext"
    | "activetext"
    | "buttonface"
    | "buttontext"
    | "field"
    | "fieldtext"
    | "highlight"
    | "highlighttext"
    | "graytext";

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-system-color}
   */
  export const parse: CSSParser<System> = Keyword.parse(
    "canvas",
    "canvastext",
    "linktext",
    "visitedtext",
    "activetext",
    "buttonface",
    "buttontext",
    "field",
    "fieldtext",
    "highlight",
    "highlighttext",
    "graytext",
  );
}
