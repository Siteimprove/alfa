import { Parser } from "@siteimprove/alfa-parser";

import { Unit } from "../../unit";

import { Keyword } from "../keyword";
import { Length, LengthPercentage, Percentage } from "../numeric";

import { Keywords } from "./keywords";
import { Side } from "./side";

const { either } = Parser;

type Offset<U extends Unit.Length = Unit.Length> =
  | Length.Fixed<U>
  | Percentage.Fixed;

/**
 * @public
 */
export type Component<
  S extends Keywords.Horizontal | Keywords.Vertical =
    | Keywords.Horizontal
    | Keywords.Vertical,
  U extends Unit.Length = Unit.Length
> = Keywords.Center | Offset<U> | Side<U, false, S>;

/**
 * @public
 */
export namespace Component {
  export type Canonical<S extends Keywords.Horizontal | Keywords.Vertical> =
    | Percentage.Canonical
    | Keywords.Center
    | Length.Canonical
    | Side.PartiallyResolved<S>;

  export type PartiallyResolved<
    S extends Keywords.Horizontal | Keywords.Vertical
  > =
    | Percentage.Canonical
    | Keywords.Center
    | Length.Canonical
    | Side.PartiallyResolved<S>;

  export type JSON =
    | Keyword.JSON
    | Length.Fixed.JSON
    | Percentage.Fixed.JSON
    | Side.JSON;

  // "center" is included in Side.parse[Horizontal, Vertical]
  /**
   * @internal
   */
  export const parseHorizontal = either(
    LengthPercentage.parseBase,
    Side.parseHorizontal
  );

  /**
   * @internal
   */
  export const parseVertical = either(
    LengthPercentage.parseBase,
    Side.parseVertical
  );
}
