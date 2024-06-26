import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "start",
  "end",
  "left",
  "right",
  "center",
  "justify",
);
