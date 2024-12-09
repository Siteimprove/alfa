import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

import { matchLayers } from "./helpers/match-layers.js";

export type CompositingOperator =
  | Keyword<"add">
  | Keyword<"subtract">
  | Keyword<"intersect">
  | Keyword<"exclude">;

export namespace CompositingOperator {
  export const parse: CSSParser<CompositingOperator> = Keyword.parse(
    "add",
    "subtract",
    "intersect",
    "exclude",
  );
  export const initialItem = Keyword.of("add");
}

type Specified = List<CompositingOperator>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([CompositingOperator.initialItem], ", "),
  List.parseCommaSeparated(CompositingOperator.parse),
  (value, style) => value.map((value) => matchLayers(value, style)),
);
