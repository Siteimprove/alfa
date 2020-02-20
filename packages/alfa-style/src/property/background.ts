import {
  Angle,
  Current,
  Gradient,
  Keyword,
  Length,
  Linear,
  List,
  Percentage,
  RGB,
  System,
  Token,
  URL
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { map, either, delimited, option, separatedList } = Parser;

export namespace Background {
  export type Color = Color.Specified | Color.Computed;

  export namespace Color {
    export type Specified = css.Color;

    export type Computed = RGB<Percentage, Percentage> | Current | System;
  }

  export const Color: Property<
    Color.Specified,
    Color.Computed
  > = Property.of(
    css.Color.rgb(
      Percentage.of(0),
      Percentage.of(0),
      Percentage.of(0),
      Percentage.of(0)
    ),
    css.Color.parse,
    style =>
      style.specified("background-color").map(color => Resolver.color(color))
  );

  export namespace Image {
    export type None = Keyword<"none">;

    export type Specified = List<None | css.Image>;

    export type Computed = List<
      | None
      | css.Image<
          | URL
          | Linear<
              | Gradient.Stop<Color.Computed, Length<"px"> | Percentage>
              | Gradient.Hint<Length<"px"> | Percentage>,
              Angle<"deg"> | Linear.Side | Linear.Corner
            >
        >
    >;
  }

  export const Image: Property<Image.Specified, Image.Computed> = Property.of(
    List.of([Keyword.of("none")], ", "),
    map(
      separatedList(
        either(Keyword.parse("none"), css.Image.parse),
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      images => List.of(images, ", ")
    ),
    style =>
      style.specified("background-image").map(images =>
        List.of(
          Iterable.map(images, image => {
            switch (image.type) {
              case "keyword":
                return image;

              case "image":
                switch (image.image.type) {
                  case "url":
                    return css.Image.of(image.image);

                  case "gradient":
                    switch (image.image.kind) {
                      case "linear": {
                        const { direction, items, repeats } = image.image;

                        return css.Image.of(
                          Linear.of(
                            direction.type === "angle"
                              ? direction.withUnit("deg")
                              : direction,
                            Iterable.map(items, item => {
                              switch (item.type) {
                                case "stop": {
                                  const { color, position } = item;

                                  return Gradient.Stop.of(
                                    Resolver.color(color),
                                    position.map(position =>
                                      position.type === "length"
                                        ? Resolver.length(position, style)
                                        : position
                                    )
                                  );
                                }

                                case "hint": {
                                  const { position } = item;

                                  return Gradient.Hint.of(
                                    position.type === "length"
                                      ? Resolver.length(position, style)
                                      : position
                                  );
                                }
                              }
                            }),
                            repeats
                          )
                        );
                      }
                    }
                }
            }
          }),
          ", "
        )
      )
  );
}
