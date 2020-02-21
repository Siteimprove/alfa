import { Keyword } from "../keyword";

/**
 * @see https://drafts.csswg.org/css-color/#css-system-colors
 */
export type System = Keyword<System.Keyword>;

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
   * @see https://drafts.csswg.org/css-color/#typedef-system-color
   */
  export const parse = Keyword.parse(
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
    "graytext"
  );
}
