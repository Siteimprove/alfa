import { Keyword } from "../keyword.js";

/**
 * @public
 */
export namespace Keywords {
  export type Center = Keyword<"center">;

  /**
   * @internal
   */
  export const parseCenter = Keyword.parse("center");

  export type Vertical = Keyword<"top"> | Keyword<"bottom">;

  /**
   * @internal
   */
  export const parseVertical = Keyword.parse("top", "bottom");

  export type Horizontal = Keyword<"left"> | Keyword<"right">;

  /**
   * @internal
   */
  export const parseHorizontal = Keyword.parse("left", "right");
}
