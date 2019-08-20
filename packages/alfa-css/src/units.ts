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

  /**
   * @see https://www.w3.org/TR/css-values/#absolute-lengths
   */
  export type AbsoluteLength = "cm" | "mm" | "Q" | "in" | "pc" | "pt" | "px";

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

  /**
   * @see https://www.w3.org/TR/css-values/#lengths
   */
  export type Length = RelativeLength | AbsoluteLength;

  export function isLength(input: string): input is Units.Length {
    return isRelativeLength(input) || isAbsoluteLength(input);
  }

  /**
   * @see https://www.w3.org/TR/css-values/#angles
   */
  export type Angle = "deg" | "grad" | "rad" | "turn";

  export function isAngle(input: string): input is Units.Angle {
    switch (input) {
      case "deg":
      case "grad":
      case "rad":
      case "turn":
        return true;
    }

    return false;
  }

  /**
   * @see https://www.w3.org/TR/css-values/#time
   */
  export type Time = "s" | "ms";

  export function isTime(input: string): input is Units.Time {
    switch (input) {
      case "s":
      case "ms":
        return true;
    }

    return false;
  }

  /**
   * @see https://www.w3.org/TR/css-values/#frequency
   */
  export type Frequency = "hz" | "kHz";

  export function isFrequency(input: string): input is Units.Frequency {
    switch (input) {
      case "hz":
      case "kHz":
        return true;
    }

    return false;
  }

  /**
   * @see https://www.w3.org/TR/css-values/#resolution
   */
  export type Resolution = "dpi" | "dpcm" | "dppx";

  export function isResolution(input: string): input is Units.Resolution {
    switch (input) {
      case "dpi":
      case "dpcm":
      case "dppx":
        return true;
    }

    return false;
  }
}
