import { Parser } from "@siteimprove/alfa-parser";

import { Unit } from "../../unit";
import { Length, Percentage } from "../numeric";

const { either } = Parser;

/**
 * @internal
 */
export type Offset<U extends Unit.Length = Unit.Length> =
  | Length.Fixed<U>
  | Percentage.Fixed;

/**
 * @internal
 */
export namespace Offset {
  export const parse = either(Length.parseBase, Percentage.parseBase);
}
