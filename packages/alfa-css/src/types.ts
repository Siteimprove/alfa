import { values } from "@siteimprove/alfa-util";
import { Token } from "./alphabet";
import { Properties } from "./properties";

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

/**
 * @see https://www.w3.org/TR/css-cascade/#initial
 */
export type Initial = "initial";

/**
 * @see https://www.w3.org/TR/css-cascade/#inherit
 */
export type Inherit = "inherit";

/**
 * @see https://www.w3.org/TR/css-cascade/#value-stages
 */
export enum Stage {
  /**
   * @see https://www.w3.org/TR/css-cascade/#cascaded
   */
  Cascaded,

  /**
   * @see https://www.w3.org/TR/css-cascade/#specified
   */
  Specified,

  /**
   * @see https://www.w3.org/TR/css-cascade/#computed
   */
  Computed
}

export type PropertyName = keyof typeof Properties;

export type PropertyType<P> = P extends Property<infer T> ? T : never;

export interface Property<T> {
  readonly inherits?: true;

  parse(input: Array<Token>): T | null;

  initial(): T;

  computed(
    own: Style<Stage.Specified>,
    parent: Style<Stage.Computed>
  ): T | null;
}

export type StyleValue<S extends Stage, V> = S extends Stage.Cascaded
  ? V | Initial | Inherit
  : V;

export type Style<S extends Stage = Stage.Computed> = Readonly<
  {
    [Name in PropertyName]?: StyleValue<
      S,
      PropertyType<typeof Properties[Name]>
    >
  }
>;
