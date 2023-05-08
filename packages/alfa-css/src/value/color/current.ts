import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Keyword } from "../keyword";

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
  export const parse: Parser<Slice<Token>, Current, string> = Keyword.parse(
    "currentcolor"
  );
}
