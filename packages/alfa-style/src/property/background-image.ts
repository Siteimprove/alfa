import {
  Angle,
  Current,
  Gradient,
  Image,
  Keyword,
  Length,
  Linear,
  List,
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
import { Selective } from "@siteimprove/alfa-selective";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Keyword<"none"> | Image;
}

/**
 * @internal
 */
export type Computed = List<
  | Keyword<"none">
  | Image<
      | URL
      | Linear<
          | Gradient.Stop<
              RGB<Percentage, Percentage> | Current | System,
              Length.Fixed<"px"> | Percentage
            >
          | Gradient.Hint<Length.Fixed<"px"> | Percentage>,
          Angle.Fixed<"deg"> | Linear.Side | Linear.Corner
        >
      | Radial<
          | Gradient.Stop<
              RGB<Percentage, Percentage> | Current | System,
              Length.Fixed<"px"> | Percentage
            >
          | Gradient.Hint<Length.Fixed<"px"> | Percentage>,
          | Radial.Circle<Length.Fixed<"px">>
          | Radial.Ellipse<Length.Fixed<"px"> | Percentage>
          | Radial.Extent,
          Position<
            Position.Component<Position.Keywords.Horizontal, "px">,
            Position.Component<Position.Keywords.Vertical, "px">
          >
        >
    >
>;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), Image.parse);

/**
 * @internal
 */
export const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("none");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-image}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) =>
    value.map((images) =>
      images.map((image) =>
        Selective.of(image)
          .if(Image.isImage, (image) => Resolver.image(image, style))
          .else((image) => image)
          .get()
      )
    )
);
