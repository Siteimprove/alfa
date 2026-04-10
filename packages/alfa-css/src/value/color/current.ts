import { type Parser as CSSParser } from "../../syntax/index.ts";

import { Keyword } from "../textual/keyword.ts";

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
  export function isCurrent(value: unknown): value is Current {
    return Keyword.isKeyword(value) && value.value === "currentcolor";
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#valdef-color-currentcolor}
   */
  export const parse: CSSParser<Current> = Keyword.parse("currentcolor");
}
