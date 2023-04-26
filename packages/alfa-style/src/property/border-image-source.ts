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
              RGB<Percentage, Percentage> | Current | System,
              Length<"px"> | Percentage
            >
          | Gradient.Hint<Length<"px"> | Percentage>,
          Angle<"deg"> | Linear.Side | Linear.Corner
        >
      | Radial<
          | Gradient.Stop<
              RGB<Percentage, Percentage> | Current | System,
              Length<"px"> | Percentage
            >
          | Gradient.Hint<Length<"px"> | Percentage>,
          | Radial.Circle<Length<"px">>
          | Radial.Ellipse<Length<"px"> | Percentage>
          | Radial.Extent,
          Position<
            Position.Component<Position.Horizontal, "px">,
            Position.Component<Position.Vertical, "px">
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
