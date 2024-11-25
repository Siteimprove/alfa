import { type Parser as CSSParser } from "../../syntax/index.js";

import { Keyword } from "../textual/keyword.js";

/**
 * {@link https://drafts.csswg.org/css-color/#currentcolor-color}
 *
 * @public
 */
export type Current = Keyword<"currentcolor">;

/**
 * @public
 */
export namespace Current {
  /**
   * {@link https://drafts.csswg.org/css-color/#valdef-color-currentcolor}
   */
  export const parse: CSSParser<Current> = Keyword.parse("currentcolor");
}
