import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "row",
  "row-reverse",
  "column",
  "column-reverse",
);
