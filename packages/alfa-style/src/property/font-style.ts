import { Longhand } from "../longhand.ts";

/**
 * {@link https://drafts.csswg.org/css-fonts/#font-style-prop}
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "italic",
  "oblique",
);
