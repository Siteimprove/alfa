import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "none",
  "auto",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
);
