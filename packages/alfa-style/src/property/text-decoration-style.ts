import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "solid",
  "double",
  "dotted",
  "dashed",
  "wavy"
);
