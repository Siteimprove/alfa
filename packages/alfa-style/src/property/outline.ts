import {
  Current,
  Keyword,
  Length,
  Percentage,
  RGB,
  System,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Value } from "../value";

const { either } = Parser;

export namespace Outline {
  /**
   * @see https://drafts.csswg.org/css-ui/#outline-width
   */
  export const Width: Property<Width.Specified, Width.Computed> = Property.of(
    Length.of(3, "px"),
    either(Keyword.parse("thin", "medium", "thick"), Length.parse),
    (style) =>
      style.computed("outline-style").flatMap((value) => {
        if (value.value === "none") {
          return Value.of(Length.of(0, "px"));
        }

        return style.specified("outline-width").map((value) => {
          switch (value.type) {
            case "keyword":
              switch (value.value) {
                case "thin":
                  return Length.of(1, "px");

                case "medium":
                  return Length.of(3, "px");

                case "thick":
                  return Length.of(5, "px");
              }

            case "length":
              return Resolver.length(value, style);
          }
        });
      })
  );

  export namespace Width {
    export type Specified =
      | Length
      | Keyword<"thin">
      | Keyword<"medium">
      | Keyword<"thick">;

    export type Computed = Length<"px">;
  }

  /**
   * @see https://drafts.csswg.org/css-ui/#outline-style
   */
  export const Style: Property<
    Style.Specified,
    Style.Computed
  > = Property.of(
    Keyword.of("none"),
    Keyword.parse(
      "auto",
      "none",
      "hidden",
      "dotted",
      "dashed",
      "solid",
      "double",
      "groove",
      "ridge",
      "inset",
      "outset"
    ),
    (style) => style.specified("outline-style")
  );

  export namespace Style {
    export type Specified =
      | Keyword<"auto">
      | Keyword<"none">
      | Keyword<"hidden">
      | Keyword<"dotted">
      | Keyword<"dashed">
      | Keyword<"solid">
      | Keyword<"double">
      | Keyword<"groove">
      | Keyword<"ridge">
      | Keyword<"inset">
      | Keyword<"outset">;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-ui/#outline-color
   */
  export const Color: Property<Color.Specified, Color.Computed> = Property.of(
    Keyword.of("invert"),
    css.Color.parse,
    (style) =>
      style.specified("outline-color").map((color) => {
        if (color.type === "keyword" && color.value === "invert") {
          return color;
        }

        return Resolver.color(color);
      })
  );

  export namespace Color {
    export type Specified = css.Color | Keyword<"invert">;

    export type Computed =
      | RGB<Percentage, Percentage>
      | Current
      | System
      | Keyword<"invert">;
  }

  /**
   * @see https://drafts.csswg.org/css-ui/#outline-offset
   */
  export const Offset: Property<
    Offset.Specified,
    Offset.Computed
  > = Property.of(Length.of(0, "px"), Length.parse, (style) =>
    style
      .specified("outline-offset")
      .map((offset) => Resolver.length(offset, style))
  );

  export namespace Offset {
    export type Specified = Length;

    export type Computed = Length<"px">;
  }

  /**
   * @see https://drafts.csswg.org/css-ui/#outline
   */
  export const Shorthand = Property.Shorthand.of(
    ["outline-width", "outline-style", "outline-color"],
    (input) => {
      let width: Width.Specified | undefined;
      let style: Style.Specified | undefined;
      let color: Color.Specified | undefined;

      while (true) {
        for (const [remainder] of Token.parseWhitespace(input)) {
          input = remainder;
        }

        if (width === undefined) {
          const result = Width.parse(input);

          if (result.isOk()) {
            [input, width] = result.get();
            continue;
          }
        }

        if (style === undefined) {
          const result = Style.parse(input);

          if (result.isOk()) {
            [input, style] = result.get();
            continue;
          }
        }

        if (color === undefined) {
          const result = Color.parse(input);

          if (result.isOk()) {
            [input, color] = result.get();
            continue;
          }
        }

        break;
      }

      if (width === undefined && style === undefined && color === undefined) {
        return Err.of(`Expected one of width, style, or color`);
      }

      return Result.of([
        input,
        [
          ["outline-width", width ?? Keyword.of("initial")],
          ["outline-style", style ?? Keyword.of("initial")],
          ["outline-color", color ?? Keyword.of("initial")],
        ],
      ]);
    }
  );
}
