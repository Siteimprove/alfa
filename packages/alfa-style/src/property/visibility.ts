import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/visibility}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: true },
  "visible",
  "hidden",
  "collapse"
);
