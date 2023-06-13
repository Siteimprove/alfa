import { Longhand } from "../longhand";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "nowrap",
  "wrap",
  "wrap-reverse"
);
