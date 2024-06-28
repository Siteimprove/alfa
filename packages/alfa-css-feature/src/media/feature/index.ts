import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import * as media from "./media.js";

import * as height from "./height.js";
import { Discrete } from "./discrete.js";
import * as scripting from "./scripting.js";
import * as width from "./width.js";

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

  export import ForcedColors = Discrete.ForcedColors;
  export import Inverted = Discrete.Inverted;
  export import PrefersColorScheme = Discrete.PrefersColorScheme;
  export import PrefersContrast = Discrete.PrefersContrast;
  export import PrefersReducedData = Discrete.PrefersReducedData;
  export import PrefersReducedMotion = Discrete.PrefersReducedMotion;
  export import PrefersReducedTransparency = Discrete.PrefersReducedTransparency;

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
        ForcedColors.parse,
        Inverted.parse,
        PrefersColorScheme.parse,
        PrefersContrast.parse,
        PrefersReducedData.parse,
        PrefersReducedMotion.parse,
        PrefersReducedTransparency.parse,
      ),
    ),
    Token.parseCloseParenthesis,
  );
}
