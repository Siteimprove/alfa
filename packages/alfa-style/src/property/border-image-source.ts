import {
  Angle,
  Current,
  Gradient,
  Image,
  Keyword,
  Length,
  Linear,
  Percentage,
  RGB,
  System,
  Token,
  URL,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Style } from "../style";

import { List } from "./value/list";

const { map, either, delimited, option, separatedList } = Parser;

declare module "../property" {
  interface Longhands {
    "border-image-source": Property<Specified, Computed>;
  }
}

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source}
 * @internal
 */
export default Property.register(
  "border-image-source",
  Property.of<Specified, Computed>(
    List.of([Keyword.of("none")], ", "),
    parseList,
    (value, style) =>
      value.map((images) =>
        List.of(
          Iterable.map(images, (image) => {
            switch (image.type) {
              case "keyword":
                return image;

              case "image":
                return resolveImage(image, style);
            }
          }),
          ", "
        )
      )
  )
);

function resolveImage(image: Image, style: Style) {
  switch (image.image.type) {
    case "url":
      return Image.of(image.image);

    case "gradient":
      return resolveGradient(image.image, style);
  }
}

function resolveGradient(gradient: Gradient, style: Style) {
  switch (gradient.kind) {
    case "linear": {
      const { direction, items, repeats } = gradient;

      return Image.of(
        Linear.of(
          direction.type === "angle" ? direction.withUnit("deg") : direction,
          Iterable.map(items, (item) => resolveGradientItem(item, style)),
          repeats
        )
      );
    }
  }
}

function resolveGradientItem(item: Gradient.Item, style: Style) {
  switch (item.type) {
    case "stop": {
      const { color, position } = item;

      return Gradient.Stop.of(
        Resolver.color(color),
        position.map((position) =>
          position.type === "length"
            ? Resolver.length(position, style)
            : position
        )
      );
    }

    case "hint": {
      const { position } = item;

      return Gradient.Hint.of(
        position.type === "length" ? Resolver.length(position, style) : position
      );
    }
  }
}
