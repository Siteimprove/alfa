/**
 * @see https://www.w3.org/TR/css-values/#relative-lengths
 */
export type RelativeLength =
  | "em"
  | "ex"
  | "ch"
  | "rem"
  | "vw"
  | "vh"
  | "vmin"
  | "vmax";

/**
 * @see https://www.w3.org/TR/css-values/#absolute-lengths
 */
export type AbsoluteLength = "cm" | "mm" | "Q" | "in" | "pc" | "pt" | "px";

/**
 * @see https://www.w3.org/TR/css-values/#angles
 */
export type Angle = "deg" | "grad" | "rad" | "turn";

/**
 * @see https://www.w3.org/TR/css-values/#time
 */
export type Time = "s" | "ms";

/**
 * @see https://www.w3.org/TR/css-values/#frequency
 */
export type Frequency = "hz" | "kHz";

/**
 * @see https://www.w3.org/TR/css-values/#resolution
 */
export type Resolution = "dpi" | "dpcm" | "dppx";
