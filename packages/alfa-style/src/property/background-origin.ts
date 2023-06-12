import { Box, List, Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Box;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @remarks
 * This is needed in the shorthand background
 *
 * @internal
 */
export const parse = Box.parse;

/**
 * @remarks
 * This is needed in the shorthand background
 *
 * @internal
 */
export const initialItem = Keyword.of("padding-box");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  List.parseCommaSeparated(parse),
  (value) => value
);
