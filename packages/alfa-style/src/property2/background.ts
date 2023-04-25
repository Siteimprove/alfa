import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { List } from "./value/list";

import { Shorthand } from "../foo-shorthand-class";

import * as Attachment from "./background-attachment";
import * as Clip from "./background-clip";
import * as Color from "./background-color";
import * as Image from "./background-image";
import * as Origin from "./background-origin";
import * as Position from "./background-position";
import * as PositionX from "./background-position-x";
import * as PositionY from "./background-position-y";
import * as Repeat from "./background-repeat";
import * as RepeatX from "./background-repeat-x";
import * as RepeatY from "./background-repeat-y";
import * as Size from "./background-size";

const { map, filter, delimited, option, right, separatedList } = Parser;

/**
 * @internal
 */
export const parse: Parser<
  Slice<Token>,
  [
    Color.Specified?,
    Image.Specified.Item?,
    PositionX.Specified.Item?,
    PositionY.Specified.Item?,
    Size.Specified.Item?,
    RepeatX.Specified.Item?,
    RepeatY.Specified.Item?,
    Attachment.Specified.Item?,
    Origin.Specified.Item?,
    Clip.Specified.Item?
  ],
  string
> = (input) => {
  let color: Color.Specified | undefined;
  let image: Image.Specified.Item | undefined;
  let positionX: PositionX.Specified.Item | undefined;
  let positionY: PositionY.Specified.Item | undefined;
  let size: Size.Specified.Item | undefined;
  let repeatX: RepeatX.Specified.Item | undefined;
  let repeatY: RepeatY.Specified.Item | undefined;
  let attachment: Attachment.Specified.Item | undefined;
  let origin: Origin.Specified.Item | undefined;
  let clip: Clip.Specified.Item | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <color>
    if (color === undefined) {
      const result = Color.parse(input);

      if (result.isOk()) {
        [input, color] = result.get();
        continue;
      }
    }

    // <image>
    if (image === undefined) {
      const result = Image.parse(input);

      if (result.isOk()) {
        [input, image] = result.get();
        continue;
      }
    }

    // <position> [ / <size> ]?
    if (positionX === undefined || positionY === undefined) {
      const result = Position.parse(input);

      if (result.isOk()) {
        [input, { horizontal: positionX, vertical: positionY }] = result.get();

        // [ / <size> ]?
        {
          const result = delimited(
            option(Token.parseWhitespace),
            right(
              delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
              Size.parse
            )
          )(input);

          if (result.isOk()) {
            [input, size] = result.get();
          }
        }

        continue;
      }
    }

    // <repeat>
    if (repeatX === undefined || repeatY === undefined) {
      const result = Repeat.parse(input);

      if (result.isOk()) {
        [input, [repeatX, repeatY]] = result.get();
        continue;
      }
    }

    // <attachment>
    if (attachment === undefined) {
      const result = Attachment.parse(input);

      if (result.isOk()) {
        [input, attachment] = result.get();
        continue;
      }
    }

    // <origin> <clip>?
    if (origin === undefined) {
      const result = Origin.parse(input);

      if (result.isOk()) {
        [input, origin] = result.get();

        // <clip>?
        {
          const result = delimited(
            option(Token.parseWhitespace),
            Clip.parse
          )(input);

          if (result.isOk()) {
            [input, clip] = result.get();
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
    ].every((property) => property === undefined)
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
      clip ?? origin,
    ],
  ]);
};

/**
 * @internal
 */
export const parseList = map(
  filter(
    separatedList(
      parse,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (layers) =>
      [...layers].slice(0, -1).every(([color]) => color === undefined),
    () => "Only the last layer may contain a color"
  ),
  (layers) => List.of(layers, ", ")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background}
 * @internal
 */
export default Shorthand.of(
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
    map(parseList, (layers) => {
      let color: Color.Specified | undefined;
      let image: Array<Image.Specified.Item> = [];
      let positionX: Array<PositionX.Specified.Item> = [];
      let positionY: Array<PositionY.Specified.Item> = [];
      let size: Array<Size.Specified.Item> = [];
      let repeatX: Array<RepeatX.Specified.Item> = [];
      let repeatY: Array<RepeatY.Specified.Item> = [];
      let attachment: Array<Attachment.Specified.Item> = [];
      let origin: Array<Origin.Specified.Item> = [];
      let clip: Array<Clip.Specified.Item> = [];

      for (const layer of layers) {
        color = layer[0];
        image.push(layer[1] ?? Image.initialItem);
        positionX.push(layer[2] ?? PositionX.initialItem);
        positionY.push(layer[3] ?? PositionY.initialItem);
        size.push(layer[4] ?? Size.initialItem);
        repeatX.push(layer[5] ?? RepeatX.initialItem);
        repeatY.push(layer[6] ?? RepeatY.initialItem);
        attachment.push(layer[7] ?? Attachment.initialItem);
        origin.push(layer[8] ?? Origin.initialItem);
        clip.push(layer[9] ?? Clip.initialItem);
      }

      return [
        ["background-color", color ?? Property.get("background-color").initial],
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
