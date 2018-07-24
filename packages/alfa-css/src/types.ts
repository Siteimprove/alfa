import { Token } from "./alphabet";
import * as Properties from "./properties";

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
export const enum Stage {
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

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-classes
 */
export type PseudoClass =
  // https://www.w3.org/TR/selectors/#matches-pseudo
  | "matches"
  // https://www.w3.org/TR/selectors/#negation-pseudo
  | "not"
  // https://www.w3.org/TR/selectors/#something-pseudo
  | "something"
  // https://www.w3.org/TR/selectors/#has-pseudo
  | "has"
  // https://www.w3.org/TR/selectors/#dir-pseudo
  | "dir"
  // https://www.w3.org/TR/selectors/#lang-pseudo
  | "lang"
  // https://www.w3.org/TR/selectors/#any-link-pseudo
  | "any-link"
  // https://www.w3.org/TR/selectors/#link-pseudo
  | "link"
  // https://www.w3.org/TR/selectors/#visited-pseudo
  | "visited"
  // https://www.w3.org/TR/selectors/#local-link-pseudo
  | "local-link"
  // https://www.w3.org/TR/selectors/#target-pseudo
  | "target"
  // https://www.w3.org/TR/selectors/#target-within-pseudo
  | "target-within"
  // https://www.w3.org/TR/selectors/#scope-pseudo
  | "scope"
  // https://www.w3.org/TR/selectors/#hover-pseudo
  | "hover"
  // https://www.w3.org/TR/selectors/#active-pseudo
  | "active"
  // https://www.w3.org/TR/selectors/#focus-pseudo
  | "focus"
  // https://www.w3.org/TR/selectors/#focus-visible-pseudo
  | "focus-visible"
  // https://www.w3.org/TR/selectors/#focus-within-pseudo
  | "focus-within"
  // https://www.w3.org/TR/selectors/#drag-pseudos
  | "drop"
  // https://www.w3.org/TR/selectors/#current-pseudo
  | "current"
  // https://www.w3.org/TR/selectors/#past-pseudo
  | "past"
  // https://www.w3.org/TR/selectors/#future-pseudo
  | "future"
  // https://www.w3.org/TR/selectors/#video-state
  | "playing"
  | "paused"
  // https://www.w3.org/TR/selectors/#enabled-pseudo
  | "enabled"
  // https://www.w3.org/TR/selectors/#disabled-pseudo
  | "disabled"
  // https://www.w3.org/TR/selectors/#read-only-pseudo
  | "read-only"
  // https://www.w3.org/TR/selectors/#read-write-pseudo
  | "read-write"
  // https://www.w3.org/TR/selectors/#placeholder-shown-pseudo
  | "placeholder-shown"
  // https://www.w3.org/TR/selectors/#default-pseudo
  | "default"
  // https://www.w3.org/TR/selectors/#checked-pseudo
  | "checked"
  // https://www.w3.org/TR/selectors/#indetermine-pseudo
  | "indetermine"
  // https://www.w3.org/TR/selectors/#valid-pseudo
  | "valid"
  // https://www.w3.org/TR/selectors/#invalid-pseudo
  | "invalid"
  // https://www.w3.org/TR/selectors/#in-range-pseudo
  | "in-range"
  // https://www.w3.org/TR/selectors/#out-of-range-pseudo
  | "out-of-range"
  // https://www.w3.org/TR/selectors/#required-pseudo
  | "required"
  // https://www.w3.org/TR/selectors/#user-invalid-pseudo
  | "user-invalid"
  // https://www.w3.org/TR/selectors/#root-pseudo
  | "root"
  // https://www.w3.org/TR/selectors/#empty-pseudo
  | "empty"
  // https://www.w3.org/TR/selectors/#blank-pseudo
  | "blank"
  // https://www.w3.org/TR/selectors/#nth-child-pseudo
  | "nth-child"
  // https://www.w3.org/TR/selectors/#nth-last-child-pseudo
  | "nth-last-child"
  // https://www.w3.org/TR/selectors/#first-child-pseudo
  | "first-child"
  // https://www.w3.org/TR/selectors/#last-child-pseudo
  | "last-child"
  // https://www.w3.org/TR/selectors/#only-child-pseudo
  | "only-child"
  // https://www.w3.org/TR/selectors/#nth-of-type-pseudo
  | "nth-of-type"
  // https://www.w3.org/TR/selectors/#nth-last-of-type-pseudo
  | "nth-last-of-type"
  // https://www.w3.org/TR/selectors/#first-of-type-pseudo
  | "first-of-type"
  // https://www.w3.org/TR/selectors/#last-of-type-pseudo
  | "last-of-type"
  // https://www.w3.org/TR/selectors/#only-of-type-pseudo
  | "only-of-type"
  // https://www.w3.org/TR/selectors/#nth-col-pseudo
  | "nth-col"
  // https://www.w3.org/TR/selectors/#nth-last-col-pseudo
  | "nth-last-col";

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-elements
 */
export type PseudoElement =
  // https://www.w3.org/TR/css-pseudo/#first-line-pseudo
  | "first-line"
  // https://www.w3.org/TR/css-pseudo/#first-letter-pseudo
  | "first-letter"
  // https://www.w3.org/TR/css-pseudo/#highlight-pseudos
  | "selection"
  | "inactive-selection"
  | "spelling-error"
  | "grammar-error"
  // https://www.w3.org/TR/css-pseudo/#generated-content
  | "before"
  | "after"
  // https://www.w3.org/TR/css-pseudo/#marker-pseudo
  | "marker"
  // https://www.w3.org/TR/css-pseudo/#placeholder-pseudo
  | "placeholder";

export type PropertyName = keyof typeof Properties;

export type PropertyType<P> = P extends Property<infer T> ? T : never;

export interface Property<T> {
  readonly inherits?: true;

  parse(input: Array<Token>): T | null;

  initial(own: Style<Stage.Specified>, parent: Style<Stage.Computed>): T;

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
