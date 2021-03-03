/**
 * @public
 */
export type Unit =
  | Unit.Length
  | Unit.Angle
  | Unit.Time
  | Unit.Frequency
  | Unit.Resolution;

/**
 * @public
 */
export namespace Unit {
  export namespace Length {
    /**
     * {@link https://drafts.csswg.org/css-values/#relative-lengths}
     */
    export type Relative = Relative.Font | Relative.Viewport;

    export namespace Relative {
      /**
       * {@link https://drafts.csswg.org/css-values/#font-relative-lengths}
       */
      export type Font = "em" | "ex" | "ch" | "rem";

      /**
       * {@link https://drafts.csswg.org/css-values/#viewport-relative-lengths}
       */
      export type Viewport = "vw" | "vh" | "vmin" | "vmax";
    }

    export function isRelative(input: string): input is Relative {
      return isFontRelative(input) || isViewportRelative(input);
    }

    export function isFontRelative(input: string): input is Relative.Font {
      switch (input) {
        case "em":
        case "ex":
        case "ch":
        case "rem":
          return true;
      }

      return false;
    }

    export function isViewportRelative(
      input: string
    ): input is Relative.Viewport {
      switch (input) {
        case "vw":
        case "vh":
        case "vmin":
        case "vmax":
          return true;
      }

      return false;
    }

    /**
     * {@link https://drafts.csswg.org/css-values/#absolute-lengths}
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

  export const {
    isRelative: isRelativeLength,
    isFontRelative: isFontRelativeLength,
    isViewportRelative: isViewportRelativeLength,
    isAbsolute: isAbsoluteLength,
  } = Length;

  /**
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export type Length = Length.Relative | Length.Absolute;

  export function isLength(input: string): input is Length {
    return isRelativeLength(input) || isAbsoluteLength(input);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#angles}
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
   * {@link https://drafts.csswg.org/css-values/#time}
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
   * {@link https://drafts.csswg.org/css-values/#frequency}
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
   * {@link https://drafts.csswg.org/css-values/#resolution}
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
