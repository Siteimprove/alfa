import {
  Token,
  Keyword,
  Length,
  Percentage,
  String,
  Number,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { map, either, option, delimited, separatedList } = Parser;

export namespace Font {
  export type Family = Family.Specified;

  export namespace Family {
    export type Generic = Keyword<
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
    export type Absolute = Keyword<
      | "xx-small"
      | "x-small"
      | "small"
      | "medium"
      | "large"
      | "x-large"
      | "xx-large"
      | "xxx-large"
    >;

    export type Relative = Keyword<"larger" | "smaller">;

    export type Specified = Absolute | Relative | Length | Percentage;

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
    either(
      either(
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
        Keyword.parse("larger", "smaller")
      ),
      either(Percentage.parse, Length.parse)
    ),
    (style) =>
      style.specified("font-size").map((size) => {
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

  export type Weight = Weight.Specified | Weight.Computed;

  export namespace Weight {
    export type Absolute = Keyword<"normal" | "bold">;

    export type Relative = Keyword<"bolder" | "lighter">;

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
}
