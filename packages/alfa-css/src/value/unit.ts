export namespace Unit {
  export namespace Length {
    /**
     * @see https://drafts.csswg.org/css-values/#relative-lengths
     */
    export type Relative =
      | "em"
      | "ex"
      | "ch"
      | "rem"
      | "vw"
      | "vh"
      | "vmin"
      | "vmax";

    export function isRelative(input: string): input is Relative {
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
     * @see https://drafts.csswg.org/css-values/#absolute-lengths
     */
    export type Absolute = "cm" | "mm" | "Q" | "in" | "pc" | "pt" | "px";

    export function isAbsolute(input: string): input is Absolute {
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
  }

  /**
   * @see https://drafts.csswg.org/css-values/#lengths
   */
  export type Length = Length.Relative | Length.Absolute;

  export function isLength(input: string): input is Length {
    return Length.isRelative(input) || Length.isAbsolute(input);
  }

  /**
   * @see https://drafts.csswg.org/css-values/#angles
   */
  export type Angle = "deg" | "grad" | "rad" | "turn";

  export function isAngle(input: string): input is Angle {
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
   * @see https://drafts.csswg.org/css-values/#time
   */
  export type Time = "s" | "ms";

  export function isTime(input: string): input is Time {
    switch (input) {
      case "s":
      case "ms":
        return true;
    }

    return false;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#frequency
   */
  export type Frequency = "hz" | "kHz";

  export function isFrequency(input: string): input is Frequency {
    switch (input) {
      case "hz":
      case "kHz":
        return true;
    }

    return false;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#resolution
   */
  export type Resolution = "dpi" | "dpcm" | "dppx";

  export function isResolution(input: string): input is Resolution {
    switch (input) {
      case "dpi":
      case "dpcm":
      case "dppx":
        return true;
    }

    return false;
  }
}
