import {
  Color,
  Current,
  Keyword,
  Length,
  Percentage,
  RGB,
  System,
  Token,
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Tuple } from "./value/tuple";

const { isKeyword } = Keyword;
const { either, map, option, separated } = Parser;

declare module "../property" {
  interface Longhands {
    "text-shadow": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | Tuple<[Option<Color>, Specified.Offset, Option<Length>]>;

namespace Specified {
  export type Offset = Tuple<[Length, Length]>;
}

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | Tuple<
      [
        // Technically, the color always compute, but to a UA dependent value
        // if none was specified.
        // Given our current use case, we can keep None in that case.
        Option<RGB<Percentage, Percentage> | Current | System>,
        Computed.Offset,
        Length<"px">
      ]
    >;

namespace Computed {
  export type Offset = Tuple<[Length<"px">, Length<"px">]>;
}

const parseOffset = map(
  separated(Length.parse, Token.parseWhitespace),
  ([x, y]) => Tuple.of(x, y)
);

const parseLengths = separated(
  parseOffset,
  Token.parseWhitespace,
  option(Length.parse)
);

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("none"),
  map(
    separated(parseLengths, Token.parseWhitespace, option(Color.parse)),
    ([[offset, blur], color]) => Tuple.of(color, offset, blur)
  ),
  map(
    separated(option(Color.parse), Token.parseWhitespace, parseLengths),
    ([color, [offset, blur]]) => Tuple.of(color, offset, blur)
  )
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow}
 * @internal
 */
export default Property.register(
  "text-shadow",
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (shadow, style) =>
    shadow.map((shadow) => {
      if (isKeyword(shadow)) {
        return shadow;
      }

      const [color, offset, blur] = shadow.values;
      const [x, y] = offset.values;

      return Tuple.of(
        color.map(Resolver.color),
        Tuple.of(Resolver.length(x, style), Resolver.length(y, style)),
        blur
          .map((blur) => Resolver.length(blur, style))
          .getOrElse(() => Length.of(0, "px"))
      );
    })
  )
);
