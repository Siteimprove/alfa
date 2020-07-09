import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

export namespace Text {
  export type Align = Keyword<
    "start" | "end" | "left" | "right" | "center" | "justify"
  >;

  /**
   * @see https://drafts.csswg.org/css-text/#propdef-text-align
   */
  export const Align: Property<Align> = Property.of(
    Keyword.of("start"),
    Keyword.parse("start", "end", "left", "right", "center", "justify"),
    (style) => style.substituted("text-align"),
    {
      inherits: true,
    }
  );

  export type Transform = Keyword<
    "none" | "capitalize" | "uppercase" | "lowercase"
  >;

  /**
   * @see https://drafts.csswg.org/css-text/#text-transform
   */
  export const Transform: Property<Transform> = Property.of(
    Keyword.of("none"),
    Keyword.parse("none", "capitalize", "uppercase", "lowercase"),
    (style) => style.substituted("text-transform"),
    {
      inherits: true,
    }
  );

  export type Overflow = Keyword<"clip" | "ellipsis">;

  /**
   * @see https://drafts.csswg.org/css-overflow/#text-overflow
   */
  export const Overflow: Property<Overflow> = Property.of(
    Keyword.of("clip"),
    Keyword.parse("clip", "ellipsis"),
    (style) => style.substituted("text-overflow")
  );
}
