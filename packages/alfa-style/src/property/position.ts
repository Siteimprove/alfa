import { Longhand } from "../longhand.js";

const positionKeywords = [
  "static",
  "relative",
  "absolute",
  "sticky",
  "fixed",
] as const;

/**
 * @internal
 */
export type PositionKeyword = (typeof positionKeywords)[number];

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position}
 * @internal
 */
export default Longhand.fromKeywords({ inherits: false }, ...positionKeywords);
