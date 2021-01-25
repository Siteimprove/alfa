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
import { Option, None, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Style } from "../style";

import { List } from "./value/list";

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

  export namespace Image {
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item = Keyword<"none"> | css.Image;
    }

    export type Computed = List<
      | Keyword<"none">
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
    type Style = Keyword<"repeat" | "space" | "round" | "no-repeat">;

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

  export namespace Attachment {
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item = Keyword<"fixed" | "local" | "scroll">;
    }

    export type Computed = Specified;
  }

  export namespace Position {
    // This should use Position.Component.Horizontal.parse (or Vertical).
    // However, two-value syntax (right 10px) is only supported by Firefox and IE
    // Moreover, the longhands are still experimental in CSS
    // Keeping this for now, may need to be revisited later.
    const parseComponent = either(
      css.Position.parseCenter,
      either(Length.parse, Percentage.parse)
    );

    const parseComponentList = map(
      separatedList(
        parseComponent,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (positions) => List.of(positions, ", ")
    );

    export const X: Property<X.Specified, X.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      parseComponentList,
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
        export type Item = css.Position.Component<css.Position.Horizontal>;
      }

      export type Computed = List<Computed.Item>;

      export namespace Computed {
        export type Item = css.Position.Component<
          css.Position.Horizontal,
          "px"
        >;
      }
    }

    export const Y: Property<Y.Specified, Y.Computed> = Property.of(
      List.of([Length.of(0, "px")]),
      parseComponentList,
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
        export type Item = css.Position.Component<css.Position.Vertical>;
      }

      export type Computed = List<Computed.Item>;

      export namespace Computed {
        export type Item = css.Position.Component<css.Position.Vertical, "px">;
      }
    }

    const parseList = map(
      separatedList(
        css.Position.parse(true),
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (positions) => List.of(positions, ", ")
    );

    export const Shorthand = Property.Shorthand.of(
      ["background-position-x", "background-position-y"],
      map(parseList, (positions) => {
        const xs: Array<X.Specified.Item> = [];
        const ys: Array<Y.Specified.Item> = [];

        for (const position of positions) {
          xs.push(position.horizontal);
          ys.push(position.vertical);
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
    export type Specified = List<Specified.Item>;

    export namespace Specified {
      export type Item =
        | [
            Length | Percentage | Keyword<"auto">,
            Length | Percentage | Keyword<"auto">
          ]
        | Keyword<"cover">
        | Keyword<"contain">;
    }

    export type Computed = List<
      | [
          Length<"px"> | Percentage | Keyword<"auto">,
          Length<"px"> | Percentage | Keyword<"auto">
        ]
      | Keyword<"cover">
      | Keyword<"contain">
    >;
  }

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-layer
   */
  const parseBackgroundLayer: Parser<
    Slice<Token>,
    [
      Option<Color.Specified>,
      Option<Image.Specified.Item>,
      Option<Position.X.Specified.Item>,
      Option<Position.Y.Specified.Item>,
      Option<Size.Specified.Item>,
      Option<Repeat.X.Specified.Item>,
      Option<Repeat.Y.Specified.Item>,
      Option<Attachment.Specified.Item>,
      Option<Origin.Specified.Item>,
      Option<Clip.Specified.Item>
    ],
    string
  > = (input) => {
    let color: Option<Color.Specified> = None;
    let image: Option<Image.Specified.Item> = None;
    let position: css.Position = css.Position.of(
      Keyword.of("center"),
      Keyword.of("center")
    );
    let positionX: Option<Position.X.Specified.Item> = None;
    let positionY: Option<Position.Y.Specified.Item> = None;
    let size: Option<Size.Specified.Item> = None;
    let repeatX: Option<Repeat.X.Specified.Item> = None;
    let repeatY: Option<Repeat.Y.Specified.Item> = None;
    let attachment: Option<Attachment.Specified.Item> = None;
    let origin: Option<Origin.Specified.Item> = None;
    let clip: Option<Clip.Specified.Item> = None;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      // <color>
      if (color.isNone()) {
        const result = parseColor(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          color = Option.of(value);
          input = remainder;
          continue;
        }
      }

      // <image>
      if (image.isNone()) {
        const result = parseImage(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          image = Option.of(value);
          input = remainder;
          continue;
        }
      }

      // <position> [ / <size> ]?
      if (positionX.isNone() || positionY.isNone()) {
        const result = css.Position.parse(true)(input);

        if (result.isOk()) {
          [input, position] = result.get();
          positionX = Some.of(position.horizontal);
          positionY = Some.of(position.vertical);

          // [ / <size> ]?
          {
            const result = delimited(
              option(Token.parseWhitespace),
              right(
                delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
                parseSize
              )
            )(input);

            if (result.isOk()) {
              const [remainder, value] = result.get();
              size = Option.of(value);
              input = remainder;
            }
          }

          continue;
        }
      }

      // <repeat>
      if (repeatX.isNone() || repeatY.isNone()) {
        const result = parseRepeat(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          repeatX = Option.of(value[0]);
          repeatY = Option.of(value[1]);
          input = remainder;
          continue;
        }
      }

      // <attachment>
      if (attachment.isNone()) {
        const result = parseAttachment(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          attachment = Option.of(value);
          input = remainder;
          continue;
        }
      }

      // <origin> <clip>?
      if (origin.isNone()) {
        const result = parseOrigin(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          origin = Option.of(value);
          input = remainder;

          // <clip>?
          {
            const result = delimited(
              option(Token.parseWhitespace),
              parseClip
            )(input);

            if (result.isOk()) {
              const [remainder, value] = result.get();
              clip = Option.of(value);
              input = remainder;
            }
          }

          continue;
        }
      }

      break;
    }

    if (
      [
        color,
        image,
        positionX,
        positionY,
        repeatX,
        repeatY,
        attachment,
        origin,
        clip,
      ].every((property) => property.isNone())
    ) {
      return Err.of(
        `Expected one of color, image, position, repeat, attachment, origin, or clip`
      );
    }

    return Result.of([
      input,
      [
        color,
        image,
        positionX,
        positionY,
        size,
        repeatX,
        repeatY,
        attachment,
        origin,
        clip.or(origin),
      ],
    ]);
  };

  const parseBackgroundLayerList = map(
    filter(
      separatedList(
        parseBackgroundLayer,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (layers) => [...layers].slice(0, -1).every(([color]) => color.isNone()),
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
        color = layer[0];
        image.push(layer[1].getOrElse(() => Keyword.of("none")));
        positionX.push(layer[2].getOrElse(() => Percentage.of(0)));
        positionY.push(layer[3].getOrElse(() => Percentage.of(0)));
        size.push(
          layer[4].getOrElse(() => [Keyword.of("auto"), Keyword.of("auto")])
        );
        repeatX.push(layer[5].getOrElse(() => Keyword.of("repeat")));
        repeatY.push(layer[6].getOrElse(() => Keyword.of("repeat")));
        attachment.push(layer[7].getOrElse(() => Keyword.of("scroll")));
        origin.push(layer[8].getOrElse(() => Keyword.of("padding-box")));
        clip.push(layer[9].getOrElse(() => Keyword.of("border-box")));
      }

      return [
        ["background-color", color.getOrElse(() => Keyword.of("initial"))],
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
