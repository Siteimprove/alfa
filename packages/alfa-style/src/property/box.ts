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
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either, option, separatedList, delimited } = Parser;

export namespace Box {
  const parseShadow: Parser<Slice<Token>, css.Shadow, string> = (input) => {
    let vertical: Length | undefined;
    let horizontal: Length | undefined;
    let blur: Length | undefined;
    let spread: Length | undefined;
    let color: Color | undefined;
    let isInset: boolean | undefined;

    const skipWhitespace = () => {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }
    };

    while (true) {
      skipWhitespace();

      if (vertical === undefined) {
        // vertical: <length>
        const result = Length.parse(input);

        if (result.isOk()) {
          [input, vertical] = result.get();
          skipWhitespace();

          {
            // horizontal: <length>
            const result = Length.parse(input);

            if (result.isErr()) {
              return result;
            }

            [input, horizontal] = result.get();
            skipWhitespace();

            {
              // blur: <length>?
              const result = Length.parse(input);

              if (result.isOk()) {
                [input, blur] = result.get();
                skipWhitespace();

                {
                  // spread: <length>?
                  const result = Length.parse(input);

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

    if (vertical === undefined || horizontal === undefined) {
      return Err.of("Expected vertical and horizontal offset");
    }

    return Result.of([
      input,
      css.Shadow.of(
        vertical,
        horizontal,
        blur ?? Length.of(0, "px"),
        spread ?? Length.of(0, "px"),
        color ?? Keyword.of("currentcolor"),
        isInset ?? false
      ),
    ]);
  };

  const parseShadowList = map(
    separatedList(
      parseShadow,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (shadows) => List.of(shadows, ", ")
  );

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-box-shadow
   */
  export const Shadow: Property<
    Shadow.Specified,
    Shadow.Computed
  > = Property.of(
    Keyword.of("auto"),
    either(Keyword.parse("auto"), parseShadowList),
    (style) =>
      style.specified("box-shadow").map((shadow) => {
        switch (shadow.type) {
          case "keyword":
            return shadow;

          case "list":
            return List.of(
              [...shadow].map((shadow) =>
                css.Shadow.of(
                  Resolver.length(shadow.vertical, style),
                  Resolver.length(shadow.horizontal, style),
                  Resolver.length(shadow.blur, style),
                  Resolver.length(shadow.spread, style),
                  Resolver.color(shadow.color),
                  shadow.isInset
                )
              )
            );
        }
      })
  );

  export namespace Shadow {
    export type Auto = Keyword<"auto">;

    export type Specified = Auto | List<css.Shadow>;

    export type Computed =
      | Auto
      | List<
          css.Shadow<
            Length<"px">,
            Length<"px">,
            Length<"px">,
            Length<"px">,
            RGB<Percentage, Percentage> | Current | System
          >
        >;
  }
}
