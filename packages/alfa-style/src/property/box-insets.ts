import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either, map, oneOrMore, separatedList } = Parser;

/**
 * @see https://drafts.csswg.org/css-position/#insets
 */

export type Inset = Inset.Specified | Inset.Computed;

export namespace Inset {
  export type Auto = Keyword<"auto">;

  export type Specified = Auto | Length | Percentage;

  export type Computed = Auto | Length<"px"> | Percentage;

  type Name =
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "inset-block-start"
    | "inset-line-start"
    | "inset-block-end"
    | "inset-line-end";

  const parseInset = either(
    Keyword.parse("auto"),
    either(Length.parse, Percentage.parse)
  );

  function inset(name: Name): Property<Specified, Computed> {
    return Property.of(Keyword.of("auto"), parseInset, (style) =>
      style.specified(name).map((property) => {
        switch (property.type) {
          case "keyword":
          case "percentage":
            return property;

          case "length":
            return Resolver.length(property, style);
        }
      })
    );
  }

  export const Top = inset("top");

  export const Right = inset("right");

  export const Bottom = inset("bottom");

  export const Left = inset("left");

  export namespace Block {
    export const Start = inset("inset-block-start");

    export const End = inset("inset-block-end");

    /**
     * @see https://drafts.csswg.org/css-position/#inset-shorthands
     */
    export const Shorthand = Property.Shorthand.of(
      ["inset-block-start", "inset-block-end"],
      map(
        separatedList(parseInset, Token.parseWhitespace),
        (values) => {
          const [start, end] = [...values];

          return [
            ["inset-block-start", start],
            ["inset-block-end", end ?? start],
          ];
        }
      )
    );
  }

  export namespace Line {
    export const Start = inset("inset-line-start");

    export const End = inset("inset-line-end");

    /**
     * @see https://drafts.csswg.org/css-position/#inset-shorthands
     */
    export const Shorthand = Property.Shorthand.of(
      ["inset-line-start", "inset-line-end"],
      map(
        separatedList(parseInset, Token.parseWhitespace),
        (values) => {
          const [start, end] = [...values];

          return [
            ["inset-line-start", start],
            ["inset-line-end", end ?? start],
          ];
        }
      )
    );
  }
}
