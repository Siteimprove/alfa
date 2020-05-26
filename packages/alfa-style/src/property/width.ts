import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

export type Width = Width.Specified | Width.Computed;

export namespace Width {
  export type Auto = Keyword<"auto">;

  export type Specified = Auto | Length | Percentage;

  export type Computed = Auto | Length<"px"> | Percentage;
}

/**
 * @see https://drafts.csswg.org/css-sizing/#propdef-width
 */
export const Width: Property<Width.Specified, Width.Computed> = Property.of(
  Keyword.of("auto"),
  either(Keyword.parse("auto"), either(Length.parse, Percentage.parse)),
  (style) =>
    style.specified("width").map((width) => {
      switch (width.type) {
        case "keyword":
        case "percentage":
          return width;

        case "length":
          return Resolver.length(width, style);
      }
    })
);
