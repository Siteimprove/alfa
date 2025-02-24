import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-break}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "keep-all",
  "break-all",
  "break-word",
);
