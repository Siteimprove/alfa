import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style}
 * @internal
 */
const property = Longhand.fromKeywords(
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

export default property;

export type Property = typeof property;
