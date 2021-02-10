import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

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
  Keyword.parse("static", "relative", "absolute", "sticky", "fixed"),
  (style) => style.specified("position")
);
