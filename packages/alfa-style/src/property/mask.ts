import {
  Token,
  List,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import { Option } from "@siteimprove/alfa-option";

import { Shorthand } from "../shorthand.js";

import * as Reference from "./mask-image.js";
import * as Size from "./mask-size.js";
import * as Repeat from "./mask-repeat.js";
import * as Mode from "./mask-mode.js";
import * as Position from "./mask-position.js";
import * as Origin from "./mask-origin.js";
import * as Clip from "./mask-clip.js";
import * as Composite from "./mask-composite.js";

const { doubleBar, map, option, pair, right, delimited, separatedList } =
  Parser;

const slash = delimited(option(Token.parseWhitespace), Token.parseDelim("/"));

const parsePosAndSize = pair(Position.parse, option(right(slash, Size.parse)));

/**
 * {@link https://drafts.fxtf.org/css-masking/#typedef-mask-layer}
 *
 * @privateRemarks
 * As of December 2024 the specification uses the <geometry-box> type in the shorthand defintion
 * whereas the longhands `mask-clip` and `mask-origin` uses <coord-box>.
 * These are not the same types - <coord-box> does not have `margin-box`.
 * Chrome and Firefox does not, at time of writing, allow `margin-box` in the shorthand.
 * Therefore we assume that the discrepancy is a spec-bug and that the intended type is <coord-box>.
 */
const parse = map(
  doubleBar<
    Slice<Token>,
    [
      Reference.Specified.Item,
      [Position.Specified.Item, Option<Size.Specified.Item>],
      Repeat.Specified.Item,
      Origin.Specified.Item,
      Clip.Specified.Item,
      Composite.Specified.Item,
      Mode.Specified.Item,
    ],
    string
  >(
    Token.parseWhitespace,
    Reference.parse,
    parsePosAndSize,
    Repeat.parse,
    Origin.parse,
    Clip.parse,
    Composite.parse,
    Mode.parse,
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

// List.parseCommaSeparated(parse);
const parseList = separatedList(
  parse,
  delimited(option(Token.parseWhitespace), Token.parseComma),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask}
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
    const images: Array<Reference.Specified.Item> = [];
    const positions: Array<Position.Specified.Item> = [];
    const sizes: Array<Size.Specified.Item> = [];
    const repeats: Array<Repeat.Specified.Item> = [];
    const origins: Array<Origin.Specified.Item> = [];
    const clips: Array<Clip.Specified.Item> = [];
    const composites: Array<Composite.Specified.Item> = [];
    const modes: Array<Mode.Specified.Item> = [];

    for (const layer of layers) {
      const [image, pos, size, repeat, origin, clip, composite, mode] = layer;
      images.push(image ?? Reference.initialItem);
      positions.push(pos ?? Position.initialItem);
      sizes.push(size ?? Size.initialItem);
      repeats.push(repeat ?? Repeat.initialItem);
      origins.push(origin ?? Origin.initialItem);
      clips.push(clip ?? Clip.initialItem);
      composites.push(composite ?? Composite.initialItem);
      modes.push(mode ?? Mode.initialItem);
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
