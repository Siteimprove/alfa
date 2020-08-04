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
import { Record } from "@siteimprove/alfa-record";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Style } from "../style";

import { List } from "./value/list";

const { map, either, delimited, option, pair, separatedList } = Parser;

export namespace Background {
  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-color
   */
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
    (style) =>
      style.specified("background-color").map((color) => Resolver.color(color))
  );

  export type Color = Color.Specified | Color.Computed;

  export namespace Color {
    export type Specified = css.Color;

    export type Computed = RGB<Percentage, Percentage> | Current | System;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-image
   */
  export const Image: Property<Image.Specified, Image.Computed> = Property.of(
    List.of([Keyword.of("none")], ", "),
    map(
      separatedList(
        either(Keyword.parse("none"), css.Image.parse),
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (images) => List.of(images, ", ")
    ),
    (style) =>
      style.specified("background-image").map((images) =>
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
  );

  export type Image = Image.Specified | Image.Computed;

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

  export namespace Repeat {
    export type Style = Keyword<"repeat" | "space" | "round" | "no-repeat">;

    const parseStyle = Keyword.parse("repeat", "space", "round", "no-repeat");

    const parseStyleList = map(
      separatedList(
        parseStyle,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (repeats) => List.of(repeats, ", ")
    );

    export const X: Property<X.Specified, X.Computed> = Property.of(
      List.of([Keyword.of("repeat")]),
      parseStyleList,
      (style) => style.specified("background-repeat-x")
    );

    export namespace X {
      export type Specified = List<Style>;
      export type Computed = Specified;
    }

    export const Y: Property<Y.Specified, Y.Computed> = Property.of(
      List.of([Keyword.of("repeat")]),
      parseStyleList,
      (style) => style.specified("background-repeat-y")
    );

    export namespace Y {
      export type Specified = List<Style>;
      export type Computed = Specified;
    }

    /**
     * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-repeat
     */
    export const Shorthand = Property.Shorthand.of(
      ["background-repeat-x", "background-repeat-y"],
      map(
        separatedList(
          either(
            pair(
              parseStyle,
              option(delimited(option(Token.parseWhitespace), parseStyle))
            ),
            Keyword.parse("repeat-x", "repeat-y")
          ),
          delimited(option(Token.parseWhitespace), Token.parseComma)
        ),
        (repeats) => {
          const xs: Array<Style> = [];
          const ys: Array<Style> = [];

          for (const repeat of repeats) {
            if (Keyword.isKeyword(repeat)) {
              switch (repeat.value) {
                case "repeat-x":
                  xs.push(Keyword.of("repeat"));
                  ys.push(Keyword.of("no-repeat"));
                  break;

                case "repeat-y":
                  xs.push(Keyword.of("no-repeat"));
                  ys.push(Keyword.of("repeat"));
              }
            } else {
              const [x, y] = repeat;

              xs.push(x);
              ys.push(y.getOr(x));
            }
          }

          return Record.of({
            "background-repeat-x": List.of(xs, ", "),
            "background-repeat-y": List.of(ys, ", "),
          });
        }
      )
    );
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-attachment
   */
  export const Attachment: Property<
    Attachment.Specified,
    Attachment.Computed
  > = Property.of(
    List.of([Keyword.of("scroll")], ", "),
    map(
      separatedList(
        Keyword.parse("fixed", "local", "scroll"),
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (repeats) => List.of(repeats, ", ")
    ),
    (style) => style.specified("background-attachment")
  );

  export type Attachment = Attachment.Specified | Attachment.Computed;

  export namespace Attachment {
    export type Specified = List<Keyword<"fixed" | "local" | "scroll">>;
    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-position
   */
  export namespace Position {
    export const X: Property<X.Specified, X.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      map(
        separatedList(
          either(
            css.Position.parseCenter,
            either(Length.parse, Percentage.parse)
          ),
          delimited(option(Token.parseWhitespace), Token.parseComma)
        ),
        (positions) => List.of(positions, ", ")
      ),
      (style) =>
        style.specified("background-position-x").map((positions) =>
          List.of(
            Iterable.map(positions, (position) => {
              switch (position.type) {
                case "keyword":
                case "percentage":
                  return position;

                case "length":
                  return Resolver.length(position, style);

                case "side":
                  return css.Position.Side.of(
                    position.side,
                    position.offset.map((offset) => {
                      switch (offset.type) {
                        case "percentage":
                          return offset;

                        case "length":
                          return Resolver.length(offset, style);
                      }
                    })
                  );
              }
            }),
            ", "
          )
        )
    );

    export namespace X {
      export type Specified = List<
        | css.Position.Center
        | css.Position.Offset
        | css.Position.Side<css.Position.Horizontal>
      >;

      export type Computed = List<
        | css.Position.Center
        | css.Position.Offset<"px">
        | css.Position.Side<css.Position.Horizontal, css.Position.Offset<"px">>
      >;
    }

    export const Y: Property<Y.Specified, Y.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      map(
        separatedList(
          either(
            css.Position.parseCenter,
            either(Length.parse, Percentage.parse)
          ),
          delimited(option(Token.parseWhitespace), Token.parseComma)
        ),
        (positions) => List.of(positions, ", ")
      ),
      (style) =>
        style.specified("background-position-y").map((positions) =>
          List.of(
            Iterable.map(positions, (position) => {
              switch (position.type) {
                case "keyword":
                case "percentage":
                  return position;

                case "length":
                  return Resolver.length(position, style);

                case "side":
                  return css.Position.Side.of(
                    position.side,
                    position.offset.map((offset) => {
                      switch (offset.type) {
                        case "percentage":
                          return offset;

                        case "length":
                          return Resolver.length(offset, style);
                      }
                    })
                  );
              }
            }),
            ", "
          )
        )
    );

    export namespace Y {
      export type Specified = List<
        | css.Position.Center
        | css.Position.Offset
        | css.Position.Side<css.Position.Vertical>
      >;

      export type Computed = List<
        | css.Position.Center
        | css.Position.Offset<"px">
        | css.Position.Side<css.Position.Vertical, css.Position.Offset<"px">>
      >;
    }

    export const Shorthand = Property.Shorthand.of(
      ["background-position-x", "background-position-y"],
      map(
        separatedList(
          either(
            either(
              // center
              map(
                Keyword.parse("center"),
                (x) => [x, Keyword.of("center")] as const
              ),

              // <length> | <percentage>
              map(
                either(Length.parse, Percentage.parse),
                (x) => [x, Keyword.of("center")] as const
              )
            ),

            either(
              // left | right
              map(
                Keyword.parse("left", "right"),
                (x) => [css.Position.Side.of(x), Keyword.of("center")] as const
              ),

              // top | bottom
              map(
                Keyword.parse("top", "bottom"),
                (y) => [Keyword.of("center"), css.Position.Side.of(y)] as const
              )
            )
          ),
          delimited(option(Token.parseWhitespace), Token.parseComma)
        ),
        (positions) => {
          const xs: Array<
            | css.Position.Center
            | css.Position.Offset
            | css.Position.Side<css.Position.Horizontal>
          > = [];

          const ys: Array<
            | css.Position.Center
            | css.Position.Offset
            | css.Position.Side<css.Position.Vertical>
          > = [];

          for (const position of positions) {
            const [x, y] = position;

            xs.push(x);
            ys.push(y);
          }

          return Record.of({
            "background-position-x": List.of(xs, ", "),
            "background-position-y": List.of(ys, ", "),
          });
        }
      )
    );
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-clip
   */

  export type Clip = Clip.Specified | Clip.Computed;

  export namespace Clip {
    export type Specified = List<
      Keyword<"border-box" | "padding-box" | "content-box">
    >;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-ackground-origin
   */

  export type Origin = Origin.Specified | Origin.Computed;

  export namespace Origin {
    export type Specified = List<
      Keyword<"border-box" | "padding-box" | "content-box">
    >;

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-size
   */

  export namespace Size {
    export type Contain = Keyword<"contain">;

    export type Cover = Keyword<"cover">;

    export type Auto = Keyword<"auto">;

    export type Specified = List<
      | [Length | Percentage | Auto, (Length | Percentage | Auto)?]
      | Cover
      | Contain
    >;

    export type Computed = List<
      | [Length<"px"> | Percentage | Auto, (Length<"px"> | Percentage | Auto)?]
      | Cover
      | Contain
    >;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background
   */
  // export const Shorthand = Property.Shorthand.of(
  //   ["background-image", "background-color"],
  //   (input) => {}
  // );
}

function resolveImage(image: Image, style: Style) {
  switch (image.image.type) {
    case "url":
      return css.Image.of(image.image);

    case "gradient":
      return resolveGradient(image.image, style);
  }
}

function resolveGradient(gradient: Gradient, style: Style) {
  switch (gradient.kind) {
    case "linear": {
      const { direction, items, repeats } = gradient;

      return css.Image.of(
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
