import { Longhand } from "../longhand.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode}
 * @internal
 */
export default Longhand.fromKeywords(
  { inherits: false },
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "plus-darker",
  "plus-lighter",
);
