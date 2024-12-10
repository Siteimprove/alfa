import {
  Token,
  List,
  type Parser as CSSParser,
  Position,
  Box,
  Keyword,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import { Option } from "@siteimprove/alfa-option";

import { Shorthand } from "../shorthand.js";

import { MaskReference } from "./mask-image.js";
import { BgSize } from "./mask-size.js";
import { RepeatStyle } from "./mask-repeat.js";
import { CompositingOperator } from "./mask-composite.js";
import { MaskingMode } from "./mask-mode.js";
import { MaskPosition } from "./mask-position.js";
import { MaskClip } from "./mask-clip.js";
import { MaskOrigin } from "./mask-origin.js";

const {
  doubleBar,
  either,
  map,
  option,
  pair,
  right,
  delimited,
  separatedList,
} = Parser;

const slash = delimited(option(Token.parseWhitespace), Token.parseDelim("/"));

const parsePosAndSize: CSSParser<[Position, Option<BgSize>]> = pair(
  Position.parse(/* legacySyntax */ true),
  option(right(slash, BgSize.parse)),
);

/**
 * {@link https://drafts.fxtf.org/css-masking/#typedef-mask-layer}
 *
 * @privateRemarks
 * As of December 2024 the specification uses the <geometry-box> type in the shorthand defintion
 * whereas the longhands `mask-clip` and `mask-origin` uses <coord-box>.
 * These are not the same types - <coord-box> does not have `margin-box`.
 * There is an open PR to fix that, which we follow.
 * {@link https://github.com/w3c/fxtf-drafts/pull/552}
 */
const maskLayer: CSSParser<
  [
    MaskReference | undefined,
    Position | undefined,
    BgSize | undefined,
    RepeatStyle | undefined,
    Box.CoordBox | undefined,
    Box.CoordBox | Keyword<"no-clip"> | undefined,
    CompositingOperator | undefined,
    MaskingMode | undefined,
  ]
> = map(
  doubleBar<
    Slice<Token>,
    [
      MaskReference,
      [Position, Option<BgSize>],
      RepeatStyle,
      Box.CoordBox,
      Box.CoordBox | Keyword<"no-clip">,
      CompositingOperator,
      MaskingMode,
    ],
    string
  >(
    Token.parseWhitespace,
    MaskReference.parse,
    parsePosAndSize,
    RepeatStyle.parse,
    Box.parseCoordBox,
    either(Box.parseCoordBox, Keyword.parse("no-clip")),
    CompositingOperator.parse,
    MaskingMode.parse,
  ),
  ([image, posAndSize, repeat, box1, box2, composite, mode]) => {
    const [pos, size] =
      posAndSize !== undefined
        ? [posAndSize[0], posAndSize[1].getOr(undefined)]
        : [undefined, undefined];

    const origin = box1;
    const clip = box2 ?? box1;

    return [image, pos, size, repeat, origin, clip, composite, mode] as const;
  },
);

const parseList = separatedList(
  maskLayer,
  delimited(option(Token.parseWhitespace), Token.parseComma),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top}
 *
 * @internal
 */
export default Shorthand.of(
  [
    "mask-image",
    "mask-position",
    "mask-size",
    "mask-repeat",
    "mask-origin",
    "mask-clip",
    "mask-composite",
    "mask-mode",
  ],
  map(parseList, (layers) => {
    const images: Array<MaskReference> = [];
    const positions: Array<Position> = [];
    const sizes: Array<BgSize> = [];
    const repeats: Array<RepeatStyle> = [];
    const origins: Array<Box.CoordBox> = [];
    const clips: Array<Box.CoordBox | Keyword<"no-clip">> = [];
    const composites: Array<CompositingOperator> = [];
    const modes: Array<MaskingMode> = [];

    for (const layer of layers) {
      const [image, pos, size, repeat, origin, clip, composite, mode] = layer;
      images.push(image ?? MaskReference.initialItem);
      positions.push(pos ?? MaskPosition.initialItem);
      sizes.push(size ?? BgSize.initialItem);
      repeats.push(repeat ?? RepeatStyle.initialItem);
      origins.push(origin ?? MaskOrigin.initialItem);
      clips.push(clip ?? MaskClip.initialItem);
      composites.push(composite ?? CompositingOperator.initialItem);
      modes.push(mode ?? MaskingMode.initialItem);
    }

    return [
      ["mask-image", List.of(images, ", ")],
      ["mask-position", List.of(positions, ", ")],
      ["mask-size", List.of(sizes, ", ")],
      ["mask-repeat", List.of(repeats, ", ")],
      ["mask-origin", List.of(origins, ", ")],
      ["mask-clip", List.of(clips, ", ")],
      ["mask-composite", List.of(composites, ", ")],
      ["mask-mode", List.of(modes, ", ")],
    ];
  }),
);
