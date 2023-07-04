import { Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"repeat">
    | Keyword<"space">
    | Keyword<"round">
    | Keyword<"no-repeat">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("repeat", "space", "round", "no-repeat");

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("repeat");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parseList,
  (value) => value
);
