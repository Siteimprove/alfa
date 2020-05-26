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
    (style) => style.specified("text-align"),
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
    (style) => style.specified("text-transform"),
    {
      inherits: true,
    }
  );
}
