import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "break-word",
  "anywhere",
);
