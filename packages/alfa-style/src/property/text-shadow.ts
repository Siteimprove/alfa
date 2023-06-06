import {
  Color,
  Current,
  Keyword,
  Length,
  Percentage,
  RGB,
  Shadow,
  System,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { isKeyword } = Keyword;
const { either, left, map, option, pair, right, separated } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | Shadow;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | Shadow<
      Length.Fixed<"px">,
      Length.Fixed<"px">,
      Length.Fixed<"px">,
      Length.Fixed<"px">,
      RGB<Percentage, Percentage> | Current | System
    >;

const parseOffset = separated(Length.parseBase, Token.parseWhitespace);

const parseLengths = pair(
  parseOffset,
  map(option(right(Token.parseWhitespace, Length.parseBase)), (blur) =>
    blur.getOr(Length.of(0, "px"))
  )
);

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("none"),
  map(
    pair(parseLengths, option(right(Token.parseWhitespace, Color.parse))),
    ([[[x, y], blur], color]) =>
      Shadow.of(
        y,
        x,
        blur,
        Length.of(0, "px"),
        color.getOr(Color.current),
        false
      )
  ),
  map(
    pair(option(left(Color.parse, Token.parseWhitespace)), parseLengths),
    ([color, [[x, y], blur]]) =>
      Shadow.of(
        y,
        x,
        blur,
        Length.of(0, "px"),
        color.getOr(Color.current),
        false
      )
  )
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (shadow, style) =>
    shadow.map((shadow) => {
      if (isKeyword(shadow)) {
        return shadow;
      }

      const resolver = Resolver.length(style);

      return Shadow.of(
        shadow.vertical.resolve(resolver),
        shadow.horizontal.resolve(resolver),
        shadow.blur.resolve(resolver),
        shadow.spread.resolve(resolver),
        Resolver.color(shadow.color),
        false
      );
    }),
  { inherits: true }
);
