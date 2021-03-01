import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";

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
  export const parse: Parser<Slice<Token>, System, string> = Keyword.parse(
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
