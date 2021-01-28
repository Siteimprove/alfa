import { Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either } = Parser;

export type Position = Position.Specified | Position.Computed;

export namespace Position {
  export type Specified =
    | Keyword<"static">
    | Keyword<"relative">
    | Keyword<"absolute">
    | Keyword<"sticky">
    | Keyword<"fixed">;

  export type Computed = Specified;
}

/**
 * @see https://drafts.csswg.org/css-position/#position-property
 */
export const Position: Property<
  Position.Specified,
  Position.Computed
> = Property.of(
  Keyword.of("static"),
  either(
    either(Keyword.parse("static"), Keyword.parse("relative")),
    either(
      Keyword.parse("absolute"),
      either(Keyword.parse("sticky"), Keyword.parse("fixed"))
    )
  ),
  (style) => style.specified("position")
);
