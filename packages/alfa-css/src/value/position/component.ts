import { Parser } from "@siteimprove/alfa-parser";

import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { Length, Percentage } from "../numeric";

import { Keywords } from "./keywords";
import { Offset } from "./offset";
import { Side } from "./side";

const { either } = Parser;

/**
 * @public
 */
export type Component<
  S extends Keywords.Horizontal | Keywords.Vertical =
    | Keywords.Horizontal
    | Keywords.Vertical,
  U extends Unit.Length = Unit.Length
> = Keywords.Center | Offset<U> | Side<S, Offset<U>>;

/**
 * @public
 */
export namespace Component {
  export type Canonical<S extends Keywords.Horizontal | Keywords.Vertical> =
    | Percentage.Canonical
    | Keywords.Center
    | Length.Canonical
    | Side.Canonical<S>;

  export type JSON =
    | Keyword.JSON
    | Length.Fixed.JSON
    | Percentage.Fixed.JSON
    | Side.JSON;

  // "center" is included in Side.parse[Horizontal, Vertical]
  /**
   * @internal
   */
  export const parseHorizontal = either(Offset.parse, Side.parseHorizontal);

  /**
   * @internal
   */
  export const parseVertical = either(Offset.parse, Side.parseVertical);
}
