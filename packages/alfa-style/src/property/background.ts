import type { Tuple } from "@siteimprove/alfa-css";
import { List, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhands } from "../longhands.js";
import { Shorthand } from "../shorthand.js";

import * as Attachment from "./background-attachment.js";
import * as Clip from "./background-clip.js";
import * as Color from "./background-color.js";
import * as Image from "./background-image.js";
import * as Origin from "./background-origin.js";
import * as Position from "./background-position.js";
import * as PositionX from "./background-position-x.js";
import * as PositionY from "./background-position-y.js";
import * as Repeat from "./background-repeat.js";
import * as RepeatX from "./background-repeat-x.js";
import * as Size from "./background-size.js";

/**
 * background-repeat-x and background-repeat-y are identical.
 * We mimic the needed bits here to avoid confusion in the main parser.
 */
namespace RepeatY {
  export namespace Specified {
    export type Item = RepeatX.Specified.Item;
  }

  export const initialItem = RepeatX.initialItem;
}

const { map, filter, delimited, option, right, separatedList } = Parser;

const parse: Parser<
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
    Clip.Specified.Item?,
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
              Size.parse,
            ),
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
        let repeat: Tuple<[RepeatX.Specified.Item, RepeatY.Specified.Item]>;
        [input, repeat] = result.get();
        [repeatX, repeatY] = repeat.values;

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
            Clip.parse,
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
      `Expected one of color, image, position, repeat, attachment, origin, or clip`,
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

const parseList = filter(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma),
  ),
  (layers) => [...layers].slice(0, -1).every((layer) => layer[0] === undefined),
  () => "Only the last layer may contain a color",
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
    const image: Array<Image.Specified.Item> = [];
    const positionX: Array<PositionX.Specified.Item> = [];
    const positionY: Array<PositionY.Specified.Item> = [];
    const size: Array<Size.Specified.Item> = [];
    const repeatX: Array<RepeatX.Specified.Item> = [];
    const repeatY: Array<RepeatY.Specified.Item> = [];
    const attachment: Array<Attachment.Specified.Item> = [];
    const origin: Array<Origin.Specified.Item> = [];
    const clip: Array<Clip.Specified.Item> = [];

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
      ["background-color", color ?? Longhands.get("background-color").initial],
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
  }),
);
