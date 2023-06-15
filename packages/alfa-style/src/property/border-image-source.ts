import {
  Angle,
  Current,
  Gradient,
  Image,
  Keyword,
  Length,
  Linear,
  Percentage,
  Position,
  Radial,
  RGB,
  System,
  URL,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | Image;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | Image<
      | URL
      | Linear<
          | Gradient.Stop<
              RGB<Percentage.Fixed, Percentage.Fixed> | Current | System,
              Length.Fixed<"px"> | Percentage.Fixed
            >
          | Gradient.Hint<Length.Fixed<"px"> | Percentage.Fixed>,
          Angle.Fixed<"deg"> | Linear.Side | Linear.Corner
        >
      | Radial<
          | Gradient.Stop<
              RGB<Percentage.Fixed, Percentage.Fixed> | Current | System,
              Length.Fixed<"px"> | Percentage.Fixed
            >
          | Gradient.Hint<Length.Fixed<"px"> | Percentage.Fixed>,
          | Radial.Circle<Length.Fixed<"px">>
          | Radial.Ellipse<Length.Fixed<"px"> | Percentage.Fixed>
          | Radial.Extent,
          Position<
            Position.Component<Position.Keywords.Horizontal, "px">,
            Position.Component<Position.Keywords.Vertical, "px">
          >
        >
    >;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), Image.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (value, style) =>
    value.map((image) => {
      switch (image.type) {
        case "keyword":
          return image;

        case "image":
          return Resolver.image(image, style);
      }
    })
);
