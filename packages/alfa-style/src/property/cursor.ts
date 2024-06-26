import {
  Keyword,
  List,
  Number,
  Token,
  Tuple,
  URL,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { left, map, option, pair, right, separated, zeroOrMore } = Parser;
const { parseComma, parseWhitespace } = Token;

namespace Specified {
  export type Builtin =
    | Keyword<"auto">
    | Keyword<"default">
    | Keyword<"none">
    | Keyword<"context-menu">
    | Keyword<"help">
    | Keyword<"pointer">
    | Keyword<"progress">
    | Keyword<"wait">
    | Keyword<"cell">
    | Keyword<"crosshair">
    | Keyword<"text">
    | Keyword<"vertical-text">
    | Keyword<"alias">
    | Keyword<"copy">
    | Keyword<"move">
    | Keyword<"no-drop">
    | Keyword<"not-allowed">
    | Keyword<"grab">
    | Keyword<"grabbing">
    | Keyword<"e-resize">
    | Keyword<"n-resize">
    | Keyword<"ne-resize">
    | Keyword<"nw-resize">
    | Keyword<"s-resize">
    | Keyword<"se-resize">
    | Keyword<"sw-resize">
    | Keyword<"w-resize">
    | Keyword<"ew-resize">
    | Keyword<"ns-resize">
    | Keyword<"nesw-resize">
    | Keyword<"nwse-resize">
    | Keyword<"col-resize">
    | Keyword<"row-resize">
    | Keyword<"all-scroll">
    | Keyword<"zoom-in">
    | Keyword<"zoom-out">;

  export type Custom = URL | Tuple<[URL, Number, Number]>;
}

type Specified = Tuple<[List<Specified.Custom>, Specified.Builtin]>;

type Computed = Tuple<[List<Computed.Custom>, Specified.Builtin]>;

namespace Computed {
  export type Custom = URL | Tuple<[URL, Number.Canonical, Number.Canonical]>;
}

const parseBuiltin = Keyword.parse(
  "auto",
  "default",
  "none",
  "context-menu",
  "help",
  "pointer",
  "progress",
  "wait",
  "cell",
  "crosshair",
  "text",
  "vertical-text",
  "alias",
  "copy",
  "move",
  "no-drop",
  "not-allowed",
  "grab",
  "grabbing",
  "e-resize",
  "n-resize",
  "ne-resize",
  "nw-resize",
  "s-resize",
  "se-resize",
  "sw-resize",
  "w-resize",
  "ew-resize",
  "ns-resize",
  "nesw-resize",
  "nwse-resize",
  "col-resize",
  "row-resize",
  "all-scroll",
  "zoom-in",
  "zoom-out",
);

const parseCustom = map(
  pair(
    URL.parse,
    option(right(parseWhitespace, separated(Number.parse, parseWhitespace))),
  ),
  ([url, coordinates]) =>
    coordinates.isSome() ? Tuple.of(url, ...coordinates.get()) : url,
);

const parseCustomList = map(
  zeroOrMore(left(parseCustom, pair(parseComma, option(parseWhitespace)))),
  (list) => List.of(list, ","),
);

const parse = map(
  separated(parseCustomList, option(parseWhitespace), parseBuiltin),
  ([custom, fallback]) => Tuple.of(custom, fallback),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(List.of([], ","), Keyword.of("auto")),
  parse,
  (value, style) => value.resolve(Resolver.length(style)),
  { inherits: true },
);
