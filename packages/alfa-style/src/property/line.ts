import { Keyword, Length, Percentage, Number } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

export namespace Line {
  export namespace Height {
    export type Normal = Keyword<"normal">;

    export type Specified = Normal | Number | Length | Percentage;

    export type Computed = Normal | Number | Length<"px">;
  }

  /**
   * @see https://drafts.csswg.org/css2/visudet.html#propdef-line-height
   */
  export const Height: Property<
    Height.Specified,
    Height.Computed
  > = Property.of(
    Keyword.of("normal"),
    either(
      Keyword.parse("normal"),
      either(Number.parse, either(Length.parse, Percentage.parse))
    ),
    (style) =>
      style.substituted("line-height").map((height) => {
        switch (height.type) {
          case "keyword":
          case "number":
            return height;

          case "length":
            return Resolver.length(height, style);

          case "percentage": {
            const parent = style.parent.computed("font-size").value;

            return Length.of(parent.value * height.value, parent.unit);
          }
        }
      }),
    {
      inherits: true,
    }
  );
}
