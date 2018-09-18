export namespace Units {
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
   * @see https://www.w3.org/TR/css-values/#lengths
   */
  export type Length = RelativeLength | AbsoluteLength;

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

  export function isRelativeLength(
    input: string
  ): input is Units.RelativeLength {
    switch (input) {
      case "em":
      case "ex":
      case "ch":
      case "rem":
      case "vw":
      case "vh":
      case "vmin":
      case "vmax":
        return true;
    }

    return false;
  }

  export function isAbsoluteLength(
    input: string
  ): input is Units.AbsoluteLength {
    switch (input) {
      case "cm":
      case "mm":
      case "Q":
      case "in":
      case "pc":
      case "pt":
      case "px":
        return true;
    }

    return false;
  }

  export function isLength(input: string): input is Units.Length {
    return isRelativeLength(input) || isAbsoluteLength(input);
  }
}
