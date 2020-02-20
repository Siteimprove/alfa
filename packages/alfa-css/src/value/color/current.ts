import { Keyword } from "../keyword";

/**
 * @see https://drafts.csswg.org/css-color/#currentcolor-color
 */
export type Current = Keyword<"currentcolor">;

export namespace Current {
  /**
   * @see https://drafts.csswg.org/css-color/#valdef-color-currentcolor
   */
  export const parse = Keyword.parse("currentcolor");
}
