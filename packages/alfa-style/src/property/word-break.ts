import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-break}
 * {@link https://drafts.csswg.org/css-text-4/#word-break-property}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "break-all",
  "keep-all",
  "manual",
  "auto-phrase",
  "break-word",
);
