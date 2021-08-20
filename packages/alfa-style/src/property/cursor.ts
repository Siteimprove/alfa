import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Tuple } from "./value/tuple";

const { map, either } = Parser;

declare module "../property" {
  interface Longhands {
    cursor: Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
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

/**
 * @internal
 */
export type Computed = Specified;

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
  "zoom-out"
);

/**
 * @internal
 */
export const parse = parseBuiltin;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
 * @internal
 */
export default Property.register(
  "cursor",
  Property.of<Specified, Computed>(Keyword.of("auto"), parse, (value) => value)
);
