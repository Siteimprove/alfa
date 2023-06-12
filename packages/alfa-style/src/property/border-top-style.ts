import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
);
