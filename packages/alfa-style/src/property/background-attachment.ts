import { Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Keyword<"fixed"> | Keyword<"local"> | Keyword<"scroll">;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("fixed", "local", "scroll");

/**
 * @internal
 */
export const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("scroll");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value) => value
);
