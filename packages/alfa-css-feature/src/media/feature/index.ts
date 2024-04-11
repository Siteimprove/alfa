import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as media from "./media";

import * as height from "./height";
import { Discrete } from "./discrete";
import * as scripting from "./scripting";
import * as width from "./width";

const { delimited, either, option } = Parser;

export type Media = media.Media;

/**
 * @public
 */
export namespace Media {
  export type JSON = media.Media.JSON;

  export import Height = height.Height;
  export import Orientation = Discrete.Orientation;
  export import Scripting = scripting.Scripting;
  export import Width = width.Width;

  export const { isHeight } = Height;
  export const { isWidth } = Width;

  export const { isMedia } = media.Media;

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-feature}
   */
  export const parse = delimited(
    Token.parseOpenParenthesis,
    delimited(
      option(Token.parseWhitespace),
      either<Slice<Token>, Media, string>(
        Height.parse,
        Orientation.parse,
        Scripting.parse,
        Width.parse,
      ),
    ),
    Token.parseCloseParenthesis,
  );
}
