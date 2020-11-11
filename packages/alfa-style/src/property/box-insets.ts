import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @see https://drafts.csswg.org/css-position/#insets
 */

export type Insets = Insets.Specified | Insets.Computed;

export namespace Insets {
  export type Auto = Keyword<"auto">;

  export type Specified = Auto | Length | Percentage;

  export type Computed = Auto | Length<"px"> | Percentage;

  type InsetNames = "top" | "right" | "bottom" | "left";

  function inset(name: InsetNames): Property<Specified, Computed> {
    return Property.of(
      Keyword.of("auto"),
      either(Keyword.parse("auto"), either(Length.parse, Percentage.parse)),
      (style) =>
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
}
