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
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Style } from "../style";

import { List } from "./value/list";

import { any } from "./combinator/any";

const {
  map,
  filter,
  either,
  delimited,
  option,
  pair,
  right,
  separatedList,
} = Parser;

export namespace Background {
  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-color
   */

  const parseColor = css.Color.parse;

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
    parseColor,
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

  const parseImage = either(Keyword.parse("none"), css.Image.parse);

  const parseImageList = map(
    separatedList(
      parseImage,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (images) => List.of(images, ", ")
  );

  export const Image: Property<Image.Specified, Image.Computed> = Property.of(
    List.of([Keyword.of("none")], ", "),
    parseImageList,
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

    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item = None | css.Image;
    }

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

  const parseRepeatStyle = Keyword.parse(
    "repeat",
    "space",
    "round",
    "no-repeat"
  );

  const parseRepeatStyleList = map(
    separatedList(
      parseRepeatStyle,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (repeats) => List.of(repeats, ", ")
  );

  const parseRepeat = either(
    map(
      pair(
        parseRepeatStyle,
        option(delimited(option(Token.parseWhitespace), parseRepeatStyle))
      ),
      ([x, y]) => [x, y.getOr(x)] as const
    ),
    either(
      map(
        Keyword.parse("repeat-x"),
        () => [Keyword.of("repeat"), Keyword.of("no-repeat")] as const
      ),
      map(
        Keyword.parse("repeat-y"),
        () => [Keyword.of("no-repeat"), Keyword.of("repeat")] as const
      )
    )
  );

  const parseRepeatList = map(
    separatedList(
      parseRepeat,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (repeats) => List.of(repeats, ", ")
  );

  export namespace Repeat {
    export type Style = Keyword<"repeat" | "space" | "round" | "no-repeat">;

    export const X: Property<X.Specified, X.Computed> = Property.of(
      List.of([Keyword.of("repeat")]),
      parseRepeatStyleList,
      (style) => style.specified("background-repeat-x")
    );

    export namespace X {
      export type Specified = List<Specified.Item>;

      export namespace Specified {
        export type Item = Style;
      }

      export type Computed = Specified;
    }

    export const Y: Property<Y.Specified, Y.Computed> = Property.of(
      List.of([Keyword.of("repeat")]),
      parseRepeatStyleList,
      (style) => style.specified("background-repeat-y")
    );

    export namespace Y {
      export type Specified = List<Specified.Item>;

      export namespace Specified {
        export type Item = Style;
      }

      export type Computed = Specified;
    }

    /**
     * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-repeat
     */
    export const Shorthand = Property.Shorthand.of(
      ["background-repeat-x", "background-repeat-y"],
      map(parseRepeatList, (repeats) => {
        const xs: Array<Style> = [];
        const ys: Array<Style> = [];

        for (const repeat of repeats) {
          const [x, y] = repeat;

          xs.push(x);
          ys.push(y);
        }

        return [
          ["background-repeat-x", List.of(xs, ", ")],
          ["background-repeat-y", List.of(ys, ", ")],
        ];
      })
    );
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-attachment
   */

  const parseAttachment = Keyword.parse("fixed", "local", "scroll");

  const parseAttachmentList = map(
    separatedList(
      parseAttachment,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (repeats) => List.of(repeats, ", ")
  );

  export const Attachment: Property<
    Attachment.Specified,
    Attachment.Computed
  > = Property.of(
    List.of([Keyword.of("scroll")], ", "),
    parseAttachmentList,
    (style) => style.specified("background-attachment")
  );

  export type Attachment = Attachment.Specified | Attachment.Computed;

  export namespace Attachment {
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item = Keyword<"fixed" | "local" | "scroll">;
    }

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-position
   */

  const parsePositionComponent = either(
    css.Position.parseCenter,
    either(Length.parse, Percentage.parse)
  );

  const parsePositionComponentList = map(
    separatedList(
      parsePositionComponent,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (positions) => List.of(positions, ", ")
  );

  const parsePosition: Parser<
    Slice<Token>,
    [Position.X.Specified.Item, Position.Y.Specified.Item],
    string
  > = map(
    any<
      Slice<Token>,
      ["x", Position.X.Specified.Item] | ["y", Position.Y.Specified.Item],
      string
    >(
      map(
        delimited(
          option(Token.parseWhitespace),
          either(
            map(Keyword.parse("left", "right", "center"), (x) =>
              x.value === "center" ? x : css.Position.Side.of(x)
            ),
            either(Length.parse, Percentage.parse)
          )
        ),
        (x) => ["x", x]
      ),
      map(
        delimited(
          option(Token.parseWhitespace),
          either(
            map(Keyword.parse("top", "bottom", "center"), (x) =>
              x.value === "center" ? x : css.Position.Side.of(x)
            ),
            either(Length.parse, Percentage.parse)
          )
        ),
        (y) => ["y", y]
      )
    ),
    (positions) => {
      let x: Position.X.Specified.Item = Keyword.of("center");
      let y: Position.Y.Specified.Item = Keyword.of("center");

      for (const position of positions) {
        switch (position[0]) {
          case "x":
            x = position[1];
            break;
          case "y":
            y = position[1];
        }
      }

      return [x, y];
    }
  );

  const parsePositionList = map(
    separatedList(
      parsePosition,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (positions) => List.of(positions, ", ")
  );

  export namespace Position {
    export const X: Property<X.Specified, X.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      parsePositionComponentList,
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
      export type Specified = List<Specified.Item>;

      export namespace Specified {
        export type Item =
          | css.Position.Center
          | css.Position.Offset
          | css.Position.Side<css.Position.Horizontal>;
      }

      export type Computed = List<
        | css.Position.Center
        | css.Position.Offset<"px">
        | css.Position.Side<css.Position.Horizontal, css.Position.Offset<"px">>
      >;
    }

    export const Y: Property<Y.Specified, Y.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      parsePositionComponentList,
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
      export type Specified = List<Specified.Item>;

      export namespace Specified {
        export type Item =
          | css.Position.Center
          | css.Position.Offset
          | css.Position.Side<css.Position.Vertical>;
      }

      export type Computed = List<
        | css.Position.Center
        | css.Position.Offset<"px">
        | css.Position.Side<css.Position.Vertical, css.Position.Offset<"px">>
      >;
    }

    export const Shorthand = Property.Shorthand.of(
      ["background-position-x", "background-position-y"],
      map(parsePositionList, (positions) => {
        const xs: Array<X.Specified.Item> = [];
        const ys: Array<Y.Specified.Item> = [];

        for (const position of positions) {
          const [x, y] = position;

          xs.push(x);
          ys.push(y);
        }

        return [
          ["background-position-x", List.of(xs, ", ")],
          ["background-position-y", List.of(ys, ", ")],
        ];
      })
    );
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-clip
   */

  const parseClip = Keyword.parse("border-box", "padding-box", "content-box");

  const parseClipList = map(
    separatedList(
      parseClip,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (repeats) => List.of(repeats, ", ")
  );

  export const Clip: Property<
    Clip.Specified,
    Clip.Computed
  > = Property.of(
    List.of([Keyword.of("border-box")], ", "),
    parseClipList,
    (style) => style.specified("background-clip")
  );

  export type Clip = Clip.Specified | Clip.Computed;

  export namespace Clip {
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item =
        | Keyword<"border-box">
        | Keyword<"padding-box">
        | Keyword<"content-box">;
    }

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-ackground-origin
   */

  const parseOrigin = Keyword.parse("border-box", "padding-box", "content-box");

  const parseOriginList = map(
    separatedList(
      parseOrigin,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (repeats) => List.of(repeats, ", ")
  );

  export const Origin: Property<
    Origin.Specified,
    Origin.Computed
  > = Property.of(
    List.of([Keyword.of("border-box")], ", "),
    parseOriginList,
    (style) => style.specified("background-origin")
  );

  export type Origin = Origin.Specified | Origin.Computed;

  export namespace Origin {
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item =
        | Keyword<"border-box">
        | Keyword<"padding-box">
        | Keyword<"content-box">;
    }

    export type Computed = Specified;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background-size
   */

  const parseSize = either(
    pair(
      either(Length.parse, Keyword.parse("auto")),
      map(option(either(Length.parse, Keyword.parse("auto"))), (y) =>
        y.getOrElse(() => Keyword.of("auto"))
      )
    ),
    Keyword.parse("contain", "cover")
  );

  const parseSizeList = map(
    separatedList(
      parseSize,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (sizes) => List.of(sizes, ", ")
  );

  export const Size: Property<Size.Specified, Size.Computed> = Property.of(
    List.of([[Keyword.of("auto"), Keyword.of("auto")]], ", "),
    parseSizeList,
    (style) =>
      style.specified("background-size").map((sizes) =>
        List.of(
          Iterable.map(sizes, (size) => {
            if (Keyword.isKeyword(size)) {
              return size;
            }

            const [x, y] = size;

            return [
              x.type === "length" ? Resolver.length(x, style) : x,
              y.type === "length" ? Resolver.length(y, style) : y,
            ];
          }),
          ", "
        )
      )
  );

  export namespace Size {
    export type Contain = Keyword<"contain">;

    export type Cover = Keyword<"cover">;

    export type Auto = Keyword<"auto">;

    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item =
        | [Length | Percentage | Auto, Length | Percentage | Auto]
        | Cover
        | Contain;
    }

    export type Computed = List<
      | [Length<"px"> | Percentage | Auto, Length<"px"> | Percentage | Auto]
      | Cover
      | Contain
    >;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-layer
   */
  const parseBackgroundLayer = map(
    any<
      Slice<Token>,
      Array<
        | ["background-color", Color.Specified]
        | ["background-image", Image.Specified.Item]
        | ["background-position-x", Position.X.Specified.Item]
        | ["background-position-y", Position.Y.Specified.Item]
        | ["background-size", Size.Specified.Item]
        | ["background-repeat-x", Repeat.X.Specified.Item]
        | ["background-repeat-y", Repeat.Y.Specified.Item]
        | ["background-attachment", Attachment.Specified.Item]
        | ["background-origin", Origin.Specified.Item]
        | ["background-clip", Clip.Specified.Item]
      >,
      string
    >(
      // <color>
      map(delimited(option(Token.parseWhitespace), parseColor), (color) => [
        ["background-color", color],
      ]),

      // <image>
      map(
        option(delimited(option(Token.parseWhitespace), parseImage)),
        (image) => [
          ["background-image", image.getOrElse(() => Keyword.of("none"))],
        ]
      ),

      // <position> [ / <size> ]?
      map(
        option(
          delimited(
            option(Token.parseWhitespace),
            pair(
              // <position>
              parsePosition,
              // [ / <side> ]?
              option(
                delimited(
                  option(Token.parseWhitespace),
                  right(
                    delimited(
                      option(Token.parseWhitespace),
                      Token.parseDelim("/")
                    ),
                    parseSize
                  )
                )
              )
            )
          )
        ),
        (result) => [
          [
            "background-position-x",
            result
              .map(([position]) => position[0])
              .getOrElse(() => Percentage.of(0)),
          ],
          [
            "background-position-y",
            result
              .map(([position]) => position[1])
              .getOrElse(() => Percentage.of(0)),
          ],
          [
            "background-size",
            result
              .flatMap(([, size]) => size)
              .getOrElse(() => [Keyword.of("auto"), Keyword.of("auto")]),
          ],
        ]
      ),

      // <repeat>
      map(
        option(delimited(option(Token.parseWhitespace), parseRepeat)),
        (repeat) => [
          [
            "background-repeat-x",
            repeat
              .map((repeat) => repeat[0])
              .getOrElse(() => Keyword.of("repeat")),
          ],
          [
            "background-repeat-y",
            repeat
              .map((repeat) => repeat[1])
              .getOrElse(() => Keyword.of("repeat")),
          ],
        ]
      ),

      // <attachment>
      map(
        option(delimited(option(Token.parseWhitespace), parseAttachment)),
        (attachment) => [
          [
            "background-attachment",
            attachment.getOrElse(() => Keyword.of("scroll")),
          ],
        ]
      ),

      // <origin> <clip>?
      map(
        option(
          delimited(
            option(Token.parseWhitespace),
            pair(
              parseOrigin,
              option(delimited(option(Token.parseWhitespace), parseClip))
            )
          )
        ),
        (result) => [
          [
            "background-origin",
            result
              .map(([origin]) => origin)
              .getOrElse(() => Keyword.of("padding-box")),
          ],
          [
            "background-clip",
            result
              .map(([origin, clip]) => clip.getOr(origin))
              .getOrElse(() => Keyword.of("border-box")),
          ],
        ]
      )
    ),
    Iterable.flatten
  );

  const parseBackgroundLayerList = map(
    filter(
      separatedList(
        parseBackgroundLayer,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (layers) =>
        [...layers]
          .slice(0, -1)
          .every((layer) =>
            [...layer].every(([property]) => property !== "background-color")
          ),
      () => "Only the last layer may contain a color"
    ),
    (layers) => List.of(layers, ", ")
  );

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#propdef-background
   */
  export const Shorthand = Property.Shorthand.of(
    [
      "background-color",
      "background-image",
      "background-position-x",
      "background-position-y",
      "background-size",
      "background-repeat-x",
      "background-repeat-y",
      "background-attachment",
      "background-origin",
      "background-clip",
    ],
    map(parseBackgroundLayerList, (layers) => {
      let color: Option<Color.Specified> = None;
      let image: Array<Image.Specified.Item> = [];
      let positionX: Array<Position.X.Specified.Item> = [];
      let positionY: Array<Position.Y.Specified.Item> = [];
      let size: Array<Size.Specified.Item> = [];
      let repeatX: Array<Repeat.X.Specified.Item> = [];
      let repeatY: Array<Repeat.Y.Specified.Item> = [];
      let attachment: Array<Attachment.Specified.Item> = [];
      let origin: Array<Origin.Specified.Item> = [];
      let clip: Array<Clip.Specified.Item> = [];

      for (const layer of layers) {
        for (const property of layer) {
          switch (property[0]) {
            case "background-color":
              color = Option.of(property[1]);
              break;
            case "background-image":
              image.push(property[1]);
              break;
            case "background-position-x":
              positionX.push(property[1]);
              break;
            case "background-position-y":
              positionY.push(property[1]);
              break;
            case "background-size":
              size.push(property[1]);
              break;
            case "background-repeat-x":
              repeatX.push(property[1]);
              break;
            case "background-repeat-y":
              repeatY.push(property[1]);
              break;
            case "background-attachment":
              attachment.push(property[1]);
              break;
            case "background-origin":
              origin.push(property[1]);
              break;
            case "background-clip":
              clip.push(property[1]);
          }
        }
      }

      return [
        ["background-color", color.getOr(Keyword.of("initial"))],
        ["background-image", List.of(image, ", ")],
        ["background-position-x", List.of(positionX, ", ")],
        ["background-position-y", List.of(positionY, ", ")],
        ["background-size", List.of(size, ", ")],
        ["background-repeat-x", List.of(repeatX, ", ")],
        ["background-repeat-y", List.of(repeatY, ", ")],
        ["background-attachment", List.of(attachment, ", ")],
        ["background-origin", List.of(origin, ", ")],
        ["background-clip", List.of(clip, ", ")],
      ];
    })
  );
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
