import { Longhand } from "../longhand";

/**
 * {@link https://drafts.csswg.org/css-fonts/#font-style-prop}
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "italic",
  "oblique"
);
