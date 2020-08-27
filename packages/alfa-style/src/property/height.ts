import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

export type Height = Height.Specified | Height.Computed;

export namespace Height {
  export type Auto = Keyword<"auto">;

  export type Specified = Auto | Length | Percentage;

  export type Computed = Auto | Length<"px"> | Percentage;
}

/**
 * @see https://drafts.csswg.org/css-sizing/#propdef-height
 */
export const Height: Property<Height.Specified, Height.Computed> = Property.of(
  Keyword.of("auto"),
  either(Keyword.parse("auto"), either(Length.parse, Percentage.parse)),
  (style) =>
    style.specified("height").map((height) => {
      switch (height.type) {
        case "keyword":
        case "percentage":
          return height;

        case "length":
          return Resolver.length(height, style);
      }
    })
);
