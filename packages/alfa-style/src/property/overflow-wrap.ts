import { Longhand } from "../longhand.js";

/**
 * {@link https://drafts.csswg.org/css-text/#overflow-wrap-property}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "break-word",
  "anywhere",
);
