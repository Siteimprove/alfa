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

import { List } from "./value/list";

const { either } = Parser;

export namespace Text {
  /**
   * @see https://drafts.csswg.org/css-text/#propdef-text-align
   */
  export const Align: Property<Align.Specified, Align.Computed> = Property.of(
    Keyword.of("start"),
    Keyword.parse("start", "end", "left", "right", "center", "justify"),
    (style) => style.specified("text-align"),
    {
      inherits: true,
    }
  );

  export namespace Align {
    export type Specified =
      | Keyword<"start">
      | Keyword<"end">
      | Keyword<"left">
      | Keyword<"right">
      | Keyword<"center">
      | Keyword<"justify">;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-text/#text-transform
   */
  export const Transform: Property<
    Transform.Specified,
    Transform.Computed
  > = Property.of(
    Keyword.of("none"),
    Keyword.parse("none", "capitalize", "uppercase", "lowercase"),
    (style) => style.specified("text-transform"),
    {
      inherits: true,
    }
  );

  export namespace Transform {
    export type Specified =
      | Keyword<"none">
      | Keyword<"capitalize">
      | Keyword<"uppercase">
      | Keyword<"lowercase">;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-overflow/#text-overflow
   */
  export const Overflow: Property<
    Overflow.Specified,
    Overflow.Computed
  > = Property.of(
    Keyword.of("clip"),
    Keyword.parse("clip", "ellipsis"),
    (style) => style.specified("text-overflow")
  );

  export namespace Overflow {
    export type Specified = Keyword<"clip"> | Keyword<"ellipsis">;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-text/#text-indent-property
   */
  export const Indent: Property<
    Indent.Specified,
    Indent.Computed
  > = Property.of(
    Length.of(0, "px"),
    either(Length.parse, Percentage.parse),
    (style) =>
      style
        .specified("text-indent")
        .map((indent) =>
          indent.type === "percentage" ? indent : Resolver.length(indent, style)
        ),
    { inherits: true }
  );

  export namespace Indent {
    export type Specified = Length | Percentage;

    export type Computed = Length<"px"> | Percentage;
  }

  export namespace Decoration {
    /**
     * @see https://drafts.csswg.org/css-text-decor/#text-decoration-line-property
     */
    export const Line: Property<Line.Specified, Line.Computed> = Property.of(
      Keyword.of("none"),
      either(Keyword.parse("none"), (input) => {
        const keywords: Array<
          | Keyword<"underline">
          | Keyword<"overline">
          | Keyword<"line-through">
          | Keyword<"blink">
        > = [];

        while (true) {
          for (const [remainder] of Token.parseWhitespace(input)) {
            input = remainder;
          }

          const result = Keyword.parse(
            "underline",
            "overline",
            "line-through",
            "blink"
          )(input);

          if (result.isOk()) {
            const [remainder, value] = result.get();

            if (keywords.every((keyword) => !keyword.equals(value))) {
              keywords.push(value);
              input = remainder;
              continue;
            }
          }

          break;
        }

        if (keywords.length === 0) {
          return Err.of(
            `Expected one of underline, overline, line-through, or blink`
          );
        }

        return Result.of([input, List.of(keywords)]);
      }),
      (style) => style.specified("text-decoration-line")
    );

    export namespace Line {
      export type Specified =
        | Keyword<"none">
        | List<
            | Keyword<"underline">
            | Keyword<"overline">
            | Keyword<"line-through">
            | Keyword<"blink">
          >;

      export type Computed = Specified;
    }

    /**
     * @see https://drafts.csswg.org/css-text-decor/#text-decoration-style-property
     */
    export const Style: Property<
      Style.Specified,
      Style.Computed
    > = Property.of(
      Keyword.of("solid"),
      Keyword.parse("solid", "double", "dotted", "dashed", "wavy"),
      (style) => style.specified("text-decoration-style")
    );

    export namespace Style {
      export type Specified =
        | Keyword<"solid">
        | Keyword<"double">
        | Keyword<"dotted">
        | Keyword<"dashed">
        | Keyword<"wavy">;

      export type Computed = Specified;
    }

    /**
     * @see https://drafts.csswg.org/css-text-decor/#text-decoration-color-property
     */
    export const Color: Property<
      Color.Specified,
      Color.Computed
    > = Property.of(Keyword.of("currentcolor"), css.Color.parse, (style) =>
      style.specified("text-decoration-color").map(Resolver.color)
    );

    export namespace Color {
      export type Specified = css.Color;

      export type Computed = RGB<Percentage, Percentage> | Current | System;
    }

    /**
     * @see https://drafts.csswg.org/css-text-decor/#text-decoration-property
     */
    export const Shorthand = Property.Shorthand.of(
      [
        "text-decoration-line",
        "text-decoration-style",
        "text-decoration-color",
      ],
      (input) => {
        let line: Line.Specified | undefined;
        let style: Style.Specified | undefined;
        let color: Color.Specified | undefined;

        while (true) {
          for (const [remainder] of Token.parseWhitespace(input)) {
            input = remainder;
          }

          if (line === undefined) {
            const result = Line.parse(input);

            if (result.isOk()) {
              [input, line] = result.get();
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

        if (line === undefined && style === undefined && color === undefined) {
          return Err.of(`Expected one of line, style, or color`);
        }

        return Result.of([
          input,
          [
            ["text-decoration-line", line ?? Keyword.of("initial")],
            ["text-decoration-style", style ?? Keyword.of("initial")],
            ["text-decoration-color", color ?? Keyword.of("initial")],
          ],
        ]);
      }
    );
  }
}
