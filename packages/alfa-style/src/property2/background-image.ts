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
  Token,
  URL,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either, delimited, option, separatedList } = Parser;

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
    >
>;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), Image.parse);

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (images) => List.of(images, ", ")
);

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
      List.of(
        Iterable.map(images, (image) => {
          switch (image.type) {
            case "keyword":
              return image;

            case "image":
              return Resolver.image(image, style);
          }
        }),
        ", "
      )
    )
);
