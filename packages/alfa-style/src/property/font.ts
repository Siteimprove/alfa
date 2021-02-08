import {
  Token,
  Keyword,
  Length,
  Percentage,
  Calculation,
  String,
  Number,
  Angle,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { Line } from "./line";

const {
  delimited,
  either,
  filter,
  map,
  option,
  pair,
  right,
  separatedList,
} = Parser;

export namespace Font {
  export type Family = Family.Specified;

  export namespace Family {
    export type Generic = Keyword.ToKeyword<
      "serif" | "sans-serif" | "cursive" | "fantasy" | "monospace"
    >;

    export type Specified = Array<Generic | String>;
  }

  /**
   * @see https://drafts.csswg.org/css-fonts/#propdef-font-family
   */
  export const Family: Property<Family.Specified> = Property.of(
    [Keyword.of("serif")],
    map(
      separatedList(
        either(
          Keyword.parse(
            "serif",
            "sans-serif",
            "cursive",
            "fantasy",
            "monospace"
          ),
          String.parse
        ),
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (families) => [...families]
    ),
    (style) => style.specified("font-family"),
    {
      inherits: true,
    }
  );

  export type Size = Size.Specified | Size.Computed;

  export namespace Size {
    export type Absolute = Keyword.ToKeyword<
      | "xx-small"
      | "x-small"
      | "small"
      | "medium"
      | "large"
      | "x-large"
      | "xx-large"
      | "xxx-large"
    >;

    export type Relative = Keyword.ToKeyword<"larger" | "smaller">;

    export type Specified =
      | Absolute
      | Relative
      | Length
      | Percentage
      | Calculation;

    export type Computed = Length<"px">;
  }

  /**
   * Base font sizes for generic font families. In browsers, these sizes depend
   * on a number of things, such as language and user configuration, but for
   * simplicity we assume a single base size for every generic font family.
   */
  const bases: { [P in Family.Generic["value"]]: number } = {
    serif: 16,
    "sans-serif": 16,
    monospace: 13,
    cursive: 16,
    fantasy: 16,
  };

  /**
   * Scaling factors for absolute font sizes. In browsers, these factors are
   * only used when the base font size are outside the range of 9 to 16 pixels.
   * Within this range, a hardcoded lookup table is used for various legacy
   * reasons but for simplicity we always rely on these scaling factors. The
   * effect of this is that we will compute font sizes that are slightly larger
   * than what browsers would render.
   *
   * @see https://drafts.csswg.org/css-fonts/#absolute-size-mapping
   */
  const factors: { [P in Size.Absolute["value"]]: number } = {
    "xx-small": 3 / 5,
    "x-small": 3 / 4,
    small: 8 / 9,
    medium: 1,
    large: 6 / 5,
    "x-large": 3 / 2,
    "xx-large": 2 / 1,
    "xxx-large": 3 / 1,
  };

  /**
   * @see https://drafts.csswg.org/css-fonts/#propdef-font-size
   */
  export const Size: Property<Size.Specified, Size.Computed> = Property.of(
    Length.of(16, "px"),
    either<Slice<Token>, Size.Specified, string>(
      Keyword.parse(
        "xx-small",
        "x-small",
        "small",
        "medium",
        "large",
        "x-large",
        "xx-large",
        "xxx-large"
      ),
      Keyword.parse("larger", "smaller"),
      Percentage.parse,
      Length.parse,
      filter(
        Calculation.parse,
        ({ expression: { kind } }) =>
          kind.is("length", 1, true) || kind.is("percentage"),
        () => `calc() expression must be of type "length" or "percentage"`
      )
    ),
    (style) =>
      style.specified("font-size").map((size) => {
        if (size.type === "calculation") {
          const { expression } = size.reduce((value) => {
            if (Length.isLength(value)) {
              return Resolver.length(value, style.parent);
            }

            if (Percentage.isPercentage(value)) {
              const parent = style.parent.computed("font-size").value;

              return Length.of(parent.value * value.value, parent.unit);
            }

            return value;
          });

          size = expression.toLength().or(expression.toPercentage()).get();
        }

        switch (size.type) {
          case "length":
            return Resolver.length(size, style.parent);

          case "percentage": {
            const parent = style.parent.computed("font-size").value;

            return Length.of(parent.value * size.value, parent.unit);
          }

          case "keyword": {
            const parent = style.parent.computed("font-size").value;

            switch (size.value) {
              case "larger":
                return Length.of(parent.value * 1.2, parent.unit);

              case "smaller":
                return Length.of(parent.value * 0.85, parent.unit);

              default: {
                const factor = factors[size.value];

                const [family] = style.computed("font-family").value;

                const base =
                  family.type === "keyword" ? bases[family.value] : bases.serif;

                return Length.of(factor * base, "px");
              }
            }
          }
        }
      }),
    {
      inherits: true,
    }
  );

  export namespace Stretch {
    export type Absolute = Keyword.ToKeyword<
      | "ultra-condensed"
      | "extra-condensed"
      | "condensed"
      | "semi-condensed"
      | "normal"
      | "semi-expanded"
      | "expanded"
      | "extra-expanded"
      | "ultra-expanded"
    >;

    export type Specified = Absolute | Percentage;

    export type Computed = Percentage;
  }

  /**
   * @see https://drafts.csswg.org/css-fonts/#font-stretch-prop
   *
   * This does *not* respect the serialisation of getComputedStyle() to keywords!
   */
  export const Stretch: Property<
    Stretch.Specified,
    Stretch.Computed
  > = Property.of(
    Percentage.of(1),
    either(
      Percentage.parse,
      Keyword.parse(
        "ultra-condensed",
        "extra-condensed",
        "condensed",
        "semi-condensed",
        "normal",
        "semi-expanded",
        "expanded",
        "extra-expanded",
        "ultra-expanded"
      )
    ),
    (style) =>
      style.specified("font-stretch").map((stretch) => {
        if (stretch.type === "percentage") {
          return stretch;
        }

        switch (stretch.value) {
          case "ultra-condensed":
            return Percentage.of(0.5);
          case "extra-condensed":
            return Percentage.of(0.625);
          case "condensed":
            return Percentage.of(0.75);
          case "semi-condensed":
            return Percentage.of(0.875);
          case "normal":
            return Percentage.of(1);
          case "semi-expanded":
            return Percentage.of(1.125);
          case "expanded":
            return Percentage.of(1.25);
          case "extra-expanded":
            return Percentage.of(1.5);
          case "ultra-expanded":
            return Percentage.of(2);
        }
      }),
    { inherits: true }
  );

  export type Style = Keyword.ToKeyword<"normal" | "italic" | "oblique">;

  /**
   * @see https://drafts.csswg.org/css-fonts/#font-style-prop
   *
   * oblique accepting an angle has poor browser support and shouldn't affect Alfa currently.
   */
  export const Style: Property<Style> = Property.of(
    Keyword.of("normal"),
    Keyword.parse("normal", "italic", "oblique"),
    (style) => style.specified("font-style"),
    {
      inherits: true,
    }
  );

  export type VariantCSS2 = Keyword.ToKeyword<"normal" | "small-caps">;

  /**
   * @see https://drafts.csswg.org/css-fonts/#font-variant-css21-values
   *
   * This is not the full font-variant property which is much more complex and not needed currently.
   * @see https://drafts.csswg.org/css-fonts/#font-variant-prop
   */
  export const VariantCSS2: Property<VariantCSS2> = Property.of(
    Keyword.of("normal"),
    Keyword.parse("normal", "small-caps"),
    (style) => style.specified("font-variant"),
    { inherits: true }
  );

  export type Weight = Weight.Specified | Weight.Computed;

  export namespace Weight {
    export type Absolute = Keyword.ToKeyword<"normal" | "bold">;

    export type Relative = Keyword.ToKeyword<"bolder" | "lighter">;

    export type Specified = Absolute | Relative | Number;

    export type Computed = Number;
  }

  /**
   * @see https://drafts.csswg.org/css-fonts/#propdef-font-weight
   */
  export const Weight: Property<
    Weight.Specified,
    Weight.Computed
  > = Property.of(
    Number.of(400),
    either(
      Number.parse,
      either(
        Keyword.parse("normal", "bold"),
        Keyword.parse("bolder", "lighter")
      )
    ),
    (style) =>
      style.specified("font-weight").map((weight) => {
        switch (weight.type) {
          case "number":
            return weight;

          case "keyword":
            switch (weight.value) {
              case "normal":
                return Number.of(400);

              case "bold":
                return Number.of(700);

              // https://drafts.csswg.org/css-fonts/#relative-weights
              default: {
                const bolder = weight.value === "bolder";
                const parent = style.parent.computed("font-weight").value;

                if (parent.value < 100) {
                  return Number.of(bolder ? 400 : parent.value);
                }

                if (parent.value < 350) {
                  return Number.of(bolder ? 400 : 100);
                }

                if (parent.value < 550) {
                  return Number.of(bolder ? 700 : 100);
                }

                if (parent.value < 750) {
                  return Number.of(bolder ? 900 : 400);
                }

                if (parent.value < 900) {
                  return Number.of(bolder ? 900 : 700);
                }

                return Number.of(bolder ? parent.value : 700);
              }
            }
        }
      }),
    {
      inherits: true,
    }
  );

  /**
   * Parses the "combinator any" part of the font shorthand.
   */
  const parseFontAny: Parser<
    Slice<Token>,
    [
      ["font-stretch", Stretch.Specified],
      ["font-style", Style],
      ["font-variant", VariantCSS2],
      ["font-weight", Weight.Specified]
    ],
    string
  > = (input) => {
    const normal = Keyword.of("normal");

    // "normal" can be a keyword for each of these four longhands, making parsing annoying…
    // Fortunately, "normal" happens to also be the initial value of these longhands.
    // So, we can have them default to "normal", and try to overwrite them as long as they still are "normal";
    // when "normal" keyword is encountered, it will be affected to the first still "normal" longhand (for no effect)
    // and the end result is OK (only the longhands with a non-"normal" specified value are changed).
    //
    // This approach will stop working if CSS ever decides that the initial value of these longhands is not "normal"
    // or that setting the shorthand does not reset all the longhands. Both seem to be unlikely changes.
    // It is nonetheless hacky to hardcode the initial value instead of using Keyword.of("initial") in the end…
    let stretch: Stretch.Specified = normal;
    let style: Style = normal;
    let variant: VariantCSS2 = normal;
    let weight: Weight.Specified = normal;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (normal.equals(stretch)) {
        // only keyword stretch are allowed in the shorthand
        const result = Keyword.parse(
          "ultra-condensed",
          "extra-condensed",
          "condensed",
          "semi-condensed",
          "normal",
          "semi-expanded",
          "expanded",
          "extra-expanded",
          "ultra-expanded"
        )(input);

        if (result.isOk()) {
          [input, stretch] = result.get();
          continue;
        }
      }

      if (normal.equals(style)) {
        const result = Style.parse(input);

        if (result.isOk()) {
          [input, style] = result.get();
          continue;
        }
      }

      if (normal.equals(variant)) {
        const result = VariantCSS2.parse(input);

        if (result.isOk()) {
          [input, variant] = result.get();
          continue;
        }
      }

      if (normal.equals(weight)) {
        const result = Weight.parse(input);

        if (result.isOk()) {
          [input, weight] = result.get();
          continue;
        }
      }

      break;
    }

    return Result.of([
      input,
      [
        ["font-stretch", stretch],
        ["font-style", style],
        ["font-variant", variant],
        ["font-weight", weight],
      ],
    ]);
  };

  /**
   * Alfa is not really equipped to deal with system fonts right now.
   * The resulting family and size depends both on the OS and on the browser.
   */
  export const Shorthand = Property.Shorthand.of(
    [
      "font-family",
      "font-size",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "line-height",
    ],
    map(
      pair(
        parseFontAny,
        pair(
          right(option(Token.parseWhitespace), Size.parse),
          pair(
            option(
              right(
                pair(
                  pair(option(Token.parseWhitespace), Token.parseDelim("/")),
                  option(Token.parseWhitespace)
                ),
                Line.Height.parse
              )
            ),
            right(Token.parseWhitespace, Family.parse)
          )
        )
      ),
      ([fontAny, [size, [lineHeight, family]]]) => [
        ...fontAny,
        ["font-size", size],
        ["line-height", lineHeight.getOr(Keyword.of("initial"))],
        ["font-family", family],
      ]
    )
  );
}
