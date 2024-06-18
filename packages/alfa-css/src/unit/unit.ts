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

    export function isRelative(unit: string): unit is Relative {
      return isFontRelative(unit) || isViewportRelative(unit);
    }

    export function isFontRelative(unit: string): unit is Relative.Font {
      switch (unit) {
        case "em":
        case "ex":
        case "ch":
        case "rem":
          return true;
      }

      return false;
    }

    export function isViewportRelative(
      unit: string,
    ): unit is Relative.Viewport {
      switch (unit) {
        case "vw":
        case "vh":
        case "vmin":
        case "vmax":
          return true;
      }

      return false;
    }

    /**
     * {@link https://drafts.csswg.org/css-values/#lengths}
     */
    export const Canonical = "px";
    export type Canonical = typeof Canonical;

    export function isCanonical(unit: string): unit is Canonical {
      return unit === Canonical;
    }

    /**
     * {@link https://drafts.csswg.org/css-values/#absolute-lengths}
     */
    export type Absolute = "cm" | "mm" | "Q" | "in" | "pc" | "pt" | Canonical;

    export function isAbsolute(unit: string): unit is Absolute {
      switch (unit) {
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

  export function isLength(unit: string): unit is Length {
    return isRelativeLength(unit) || isAbsoluteLength(unit);
  }

  export namespace Angle {
    /**
     * {@link https://drafts.csswg.org/css-values/#angles}
     */
    export const Canonical = "deg";
    export type Canonical = typeof Canonical;

    export function isCanonical(unit: string): unit is Canonical {
      return unit === Canonical;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#angles}
   */
  export type Angle = Angle.Canonical | "grad" | "rad" | "turn";

  export function isAngle(unit: string): unit is Angle {
    switch (unit) {
      case "deg":
      case "grad":
      case "rad":
      case "turn":
        return true;
    }

    return false;
  }

  export namespace Time {
    /**
     * {@link https://drafts.csswg.org/css-values/#time}
     */
    export const Canonical = "s";
    export type Canonical = typeof Canonical;

    export function isCanonical(unit: string): unit is Canonical {
      return unit === Canonical;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#time}
   */
  export type Time = Time.Canonical | "ms";

  export function isTime(unit: string): unit is Time {
    switch (unit) {
      case "s":
      case "ms":
        return true;
    }

    return false;
  }

  export namespace Frequency {
    /**
     * {@link https://drafts.csswg.org/css-values/#frequency}
     */
    export const Canonical = "hz";
    export type Canonical = typeof Canonical;

    export function isCanonical(unit: string): unit is Canonical {
      return unit === Canonical;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#frequency}
   */
  export type Frequency = Frequency.Canonical | "kHz";

  export function isFrequency(unit: string): unit is Frequency {
    switch (unit) {
      case "hz":
      case "kHz":
        return true;
    }

    return false;
  }

  export namespace Resolution {
    /**
     * {@link https://drafts.csswg.org/css-values/#resolution}
     */
    export const Canonical = "dppx";
    export type Canonical = typeof Canonical;

    export function isCanonical(unit: string): unit is Canonical {
      return unit === Canonical;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#resolution}
   */
  export type Resolution = "dpi" | "dpcm" | Resolution.Canonical;

  export function isResolution(unit: string): unit is Resolution {
    switch (unit) {
      case "dpi":
      case "dpcm":
      case "dppx":
        return true;
    }

    return false;
  }
}
