import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "static",
  "relative",
  "absolute",
  "sticky",
  "fixed",
);
