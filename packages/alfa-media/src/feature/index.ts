import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import * as feature from "./feature";

import * as height from "./height";
import * as orientation from "./orientation";
import * as scripting from "./scripting";
import * as width from "./width";

const { delimited, either, option } = Parser;

export type Feature = feature.Feature;

export namespace Feature {
  export type JSON = feature.Feature.JSON;

  export import Height = height.Height;
  export import Orientation = orientation.Orientation;
  export import Scripting = scripting.Scripting;
  export import Width = width.Width;

  export const { isHeight } = Height;
  export const { isWidth } = Width;

  export const { isFeature } = feature.Feature;

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-feature}
   */
  export const parse = delimited(
    Token.parseOpenParenthesis,
    delimited(
      option(Token.parseWhitespace),
      either(Height.parse, Orientation.parse, Scripting.parse, Width.parse),
    ),
    Token.parseCloseParenthesis,
  );
}
