import { Length as CSSLength } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Length } from "./value/compound";

/**
 * @internal
 */
export type Specified = Length.Length;

/**
 * @internal
 */
export type Computed = CSSLength<"px">;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Longhand.of<Specified, Computed>(
  CSSLength.of(0, "px"),
  Length.parse,
  (value, style) => value.map((offset) => Length.resolve(offset, style))
);
