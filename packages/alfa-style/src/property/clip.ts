import { Shape, Keyword, Rectangle } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either, map } = Parser;

export namespace Clip {
  export type Auto = Keyword<"auto">;

  export type Specified = Auto | Shape<Rectangle, Keyword<"border-box">>;

  export type Computed = Specified;
}

/**
 * @see https://drafts.fxtf.org/css-masking/#clip-property
 */
export const Clip: Property<Clip.Specified, Clip.Computed> = Property.of(
  Keyword.of("auto"),
  either(
    Keyword.parse("auto"),
    map(Rectangle.parse, (rectangle) =>
      Shape.of(rectangle, Keyword.of("border-box"))
    )
  ),
  (style) => style.specified("clip")
);
