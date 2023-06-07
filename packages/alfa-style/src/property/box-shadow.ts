import {
  Color,
  Current,
  Keyword,
  Length,
  List,
  Percentage,
  RGB,
  Shadow,
  System,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { map, either, option, separatedList, delimited } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | List<Shadow>;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | List<
      Shadow<
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        RGB<Percentage, Percentage> | Current | System
      >
    >;

/**
 * @internal
 */
export const parse: Parser<Slice<Token>, Shadow, string> = (input) => {
  let horizontal: Length.Fixed | undefined;
  let vertical: Length.Fixed | undefined;
  let blur: Length.Fixed | undefined;
  let spread: Length.Fixed | undefined;
  let color: Color | undefined;
  let isInset: boolean | undefined;

  const skipWhitespace = () => {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }
  };

  while (true) {
    skipWhitespace();

    if (horizontal === undefined) {
      // horizontal: <length>
      const result = Length.parseBase(input);

      if (result.isOk()) {
        [input, horizontal] = result.get();
        skipWhitespace();

        {
          // vertical: <length>
          const result = Length.parseBase(input);

          if (result.isErr()) {
            return result;
          }

          // the previous check ensure that the result is Ok
          [input, vertical] = result.getUnsafe();
          skipWhitespace();

          {
            // blur: <length>?
            const result = Length.parseBase(input);

            if (result.isOk()) {
              [input, blur] = result.get();
              skipWhitespace();

              {
                // spread: <length>?
                const result = Length.parseBase(input);

                if (result.isOk()) {
                  [input, spread] = result.get();
                }
              }
            }
          }
        }

        continue;
      }
    }

    if (color === undefined) {
      // color: <color>?
      const result = Color.parse(input);

      if (result.isOk()) {
        [input, color] = result.get();
        continue;
      }
    }

    if (isInset === undefined) {
      // isInset: inset?
      const result = Keyword.parse("inset")(input);

      if (result.isOk()) {
        isInset = true;
        [input] = result.get();
        continue;
      }
    }

    break;
  }

  if (horizontal === undefined || vertical === undefined) {
    return Err.of("Expected horizontal and vertical offset");
  }

  return Result.of([
    input,
    Shadow.of(
      horizontal,
      vertical,
      blur ?? Length.of(0, "px"),
      spread ?? Length.of(0, "px"),
      color ?? Keyword.of("currentcolor"),
      isInset ?? false
    ),
  ]);
};

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (shadows) => List.of(shadows, ", ")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), parseList),
  (boxShadow, style) =>
    boxShadow.map((value) => {
      switch (value.type) {
        case "keyword":
          return value;

        case "list":
          const resolver = Resolver.length(style);

          return List.of(
            [...value].map((shadow) =>
              Shadow.of(
                shadow.horizontal.resolve(resolver),
                shadow.vertical.resolve(resolver),
                shadow.blur.resolve(resolver),
                shadow.spread.resolve(resolver),
                Resolver.color(shadow.color),
                shadow.isInset
              )
            )
          );
      }
    })
);
