import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Token } from "../../../../syntax/index.js";

import { Angle } from "../../../numeric/index.js";

import { Corner } from "./corner.js";
import { Side } from "./side.js";

const { either } = Parser;

/**
 * @internal
 */
export type Direction = Angle | Corner | Side;

/**
 * @internal
 */
export namespace Direction {
  export type JSON = Angle.JSON | Corner.JSON | Side.JSON;

  export type Canonical = Angle.Canonical | Corner.Canonical | Side.Canonical;

  export type Resolver = Angle.Resolver & Corner.Resolver & Side.Resolver;

  /**
   * @internal
   */
  export const parse = either<Slice<Token>, Direction, string>(
    Angle.parse,
    // Corners must be parsed before sides as sides are also valid prefixes of
    // corners.
    Corner.parse,
    Side.parse,
  );
}
