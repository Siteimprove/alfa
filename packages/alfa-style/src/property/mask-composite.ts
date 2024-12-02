import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

type CompositingOperator =
  | Keyword<"add">
  | Keyword<"subtract">
  | Keyword<"intersect">
  | Keyword<"exclude">;
const compositingOperator: CSSParser<CompositingOperator> = Keyword.parse(
  "add",
  "subtract",
  "intersect",
  "exclude",
);

type Specified = List<CompositingOperator>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("add")]),
  List.parseCommaSeparated(compositingOperator),
  (value) => value,
);
