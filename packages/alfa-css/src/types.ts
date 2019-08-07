import { Token } from "./alphabet";
import { Values } from "./values";

/**
 * @see https://www.w3.org/TR/css-syntax/#declaration
 */
export interface Declaration {
  readonly name: string;
  readonly value: Array<Token>;
  readonly important: boolean;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#at-rule
 */
export interface AtRule {
  readonly name: string;
  readonly prelude: Array<Token>;
  readonly value?: Array<Token>;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#qualified-rule
 */
export interface QualifiedRule {
  readonly prelude: Array<Token>;
  readonly value: Array<Token>;
}

export type Rule = AtRule | QualifiedRule;

export const enum SelectorType {
  IdSelector = 1,
  ClassSelector = 2,
  AttributeSelector = 4,
  TypeSelector = 8,
  PseudoClassSelector = 16,
  PseudoElementSelector = 32,
  CompoundSelector = 64,
  RelativeSelector = 128
}

export interface IdSelector {
  readonly type: SelectorType.IdSelector;
  readonly name: string;
}

export interface ClassSelector {
  readonly type: SelectorType.ClassSelector;
  readonly name: string;
}

export const enum AttributeMatcher {
  /**
   * @example [foo=bar]
   */
  Equal,

  /**
   * @example [foo~=bar]
   */
  Includes,

  /**
   * @example [foo|=bar]
   */
  DashMatch,

  /**
   * @example [foo^=bar]
   */
  Prefix,

  /**
   * @example [foo$=bar]
   */
  Suffix,

  /**
   * @example [foo*=bar]
   */
  Substring
}

export const enum AttributeModifier {
  /**
   * @example [foo=bar i]
   */
  CaseInsensitive = 1
}

export interface AttributeSelector {
  readonly type: SelectorType.AttributeSelector;
  readonly name: string;
  readonly namespace: string | null;
  readonly value: string | null;
  readonly matcher: AttributeMatcher | null;
  readonly modifier: number;
}

export interface TypeSelector {
  readonly type: SelectorType.TypeSelector;
  readonly name: string;
  readonly namespace: string | null;
}

export type SimpleSelector =
  | IdSelector
  | ClassSelector
  | TypeSelector
  | AttributeSelector
  | PseudoClassSelector
  | PseudoElementSelector;

export interface CompoundSelector {
  readonly type: SelectorType.CompoundSelector;
  readonly left: SimpleSelector;
  readonly right: SimpleSelector | CompoundSelector;
}

export type ComplexSelector = SimpleSelector | CompoundSelector;

export const enum SelectorCombinator {
  /**
   * @example div span
   */
  Descendant,

  /**
   * @example div > span
   */
  DirectDescendant,

  /**
   * @example div ~ span
   */
  Sibling,

  /**
   * @example div + span
   */
  DirectSibling
}

export interface RelativeSelector {
  readonly type: SelectorType.RelativeSelector;
  readonly combinator: SelectorCombinator;
  readonly left: ComplexSelector | RelativeSelector;
  readonly right: ComplexSelector;
}

export type Selector = ComplexSelector | RelativeSelector;

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-classes
 */
export namespace PseudoClassSelector {
  interface PseudoClassSelector<N extends string> {
    readonly type: SelectorType.PseudoClassSelector;
    readonly name: N;
  }

  export interface WithValue<V> {
    readonly value: V;
  }

  export interface WithSelector extends WithValue<Array<Selector>> {}

  export interface WithChildIndex extends WithValue<ChildIndex> {}

  // https://www.w3.org/TR/selectors/#matches-pseudo
  export interface Is extends PseudoClassSelector<"is">, WithSelector {}

  // https://www.w3.org/TR/selectors/#negation-pseudo
  export interface Not extends PseudoClassSelector<"not">, WithSelector {}

  // https://www.w3.org/TR/selectors/#has-pseudo
  export interface Has extends PseudoClassSelector<"has">, WithSelector {}

  // https://www.w3.org/TR/selectors/#dir-pseudo
  export interface Dir
    extends PseudoClassSelector<"dir">,
      WithValue<"ltr" | "rtl"> {}

  // https://www.w3.org/TR/selectors/#lang-pseudo
  export interface Lang
    extends PseudoClassSelector<"lang">,
      WithValue<Iterable<string>> {}

  // https://www.w3.org/TR/selectors/#any-link-pseudo
  export interface AnyLink extends PseudoClassSelector<"any-link"> {}

  // https://www.w3.org/TR/selectors/#link-pseudo
  export interface Link extends PseudoClassSelector<"link"> {}

  // https://www.w3.org/TR/selectors/#visited-pseudo
  export interface Visited extends PseudoClassSelector<"visited"> {}

  // https://www.w3.org/TR/selectors/#local-link-pseudo
  export interface LocalLink extends PseudoClassSelector<"local-link"> {}

  // https://www.w3.org/TR/selectors/#target-pseudo
  export interface Target extends PseudoClassSelector<"target"> {}

  // https://www.w3.org/TR/selectors/#target-within-pseudo
  export interface TargetWithin extends PseudoClassSelector<"target-within"> {}

  // https://www.w3.org/TR/selectors/#scope-pseudo
  export interface Scope extends PseudoClassSelector<"scope"> {}

  // https://www.w3.org/TR/selectors/#hover-pseudo
  export interface Hover extends PseudoClassSelector<"hover"> {}

  // https://www.w3.org/TR/selectors/#active-pseudo
  export interface Active extends PseudoClassSelector<"active"> {}

  // https://www.w3.org/TR/selectors/#focus-pseudo
  export interface Focus extends PseudoClassSelector<"focus"> {}

  // https://www.w3.org/TR/selectors/#focus-visible-pseudo
  export interface FocusVisible extends PseudoClassSelector<"focus-visible"> {}

  // https://www.w3.org/TR/selectors/#focus-within-pseudo
  export interface FocusWithin extends PseudoClassSelector<"focus-within"> {}

  // https://www.w3.org/TR/selectors/#current-pseudo
  export interface Current
    extends PseudoClassSelector<"current">,
      Partial<WithSelector> {}

  // https://www.w3.org/TR/selectors/#past-pseudo
  export interface Past extends PseudoClassSelector<"past"> {}

  // https://www.w3.org/TR/selectors/#future-pseudo
  export interface Future extends PseudoClassSelector<"future"> {}

  // https://www.w3.org/TR/selectors/#video-state
  export interface Playing extends PseudoClassSelector<"playing"> {}

  export interface Paused extends PseudoClassSelector<"paused"> {}

  // https://www.w3.org/TR/selectors/#enabled-pseudo
  export interface Enabled extends PseudoClassSelector<"enabled"> {}

  // https://www.w3.org/TR/selectors/#disabled-pseudo
  export interface Disabled extends PseudoClassSelector<"disabled"> {}

  // https://www.w3.org/TR/selectors/#read-only-pseudo
  export interface ReadOnly extends PseudoClassSelector<"read-only"> {}

  // https://www.w3.org/TR/selectors/#read-write-pseudo
  export interface ReadWrite extends PseudoClassSelector<"read-write"> {}

  // https://www.w3.org/TR/selectors/#placeholder-shown-pseudo
  export interface PlaceholderShown
    extends PseudoClassSelector<"placeholder-shown"> {}

  // https://www.w3.org/TR/selectors/#default-pseudo
  export interface Default extends PseudoClassSelector<"default"> {}

  // https://www.w3.org/TR/selectors/#checked-pseudo
  export interface Checked extends PseudoClassSelector<"checked"> {}

  // https://www.w3.org/TR/selectors/#indetermine-pseudo
  export interface Indetermine extends PseudoClassSelector<"indetermine"> {}

  // https://www.w3.org/TR/selectors/#valid-pseudo
  export interface Valid extends PseudoClassSelector<"valid"> {}

  // https://www.w3.org/TR/selectors/#invalid-pseudo
  export interface Invalid extends PseudoClassSelector<"invalid"> {}

  // https://www.w3.org/TR/selectors/#in-range-pseudo
  export interface InRange extends PseudoClassSelector<"in-range"> {}

  // https://www.w3.org/TR/selectors/#out-of-range-pseudo
  export interface OutOfRange extends PseudoClassSelector<"out-of-range"> {}

  // https://www.w3.org/TR/selectors/#required-pseudo
  export interface Required extends PseudoClassSelector<"required"> {}

  // https://www.w3.org/TR/selectors/#user-invalid-pseudo
  export interface UserInvalid extends PseudoClassSelector<"user-invalid"> {}

  // https://drafts.csswg.org/css-scoping/#host-selector
  export interface Host
    extends PseudoClassSelector<"host">,
      Partial<WithSelector> {}

  // https://drafts.csswg.org/css-scoping/#host-selector
  export interface HostContext
    extends PseudoClassSelector<"host-context">,
      WithSelector {}

  // https://www.w3.org/TR/selectors/#root-pseudo
  export interface Root extends PseudoClassSelector<"root"> {}

  // https://www.w3.org/TR/selectors/#empty-pseudo
  export interface Empty extends PseudoClassSelector<"empty"> {}

  // https://www.w3.org/TR/selectors/#blank-pseudo
  export interface Blank extends PseudoClassSelector<"blank"> {}

  // https://www.w3.org/TR/selectors/#first-child-pseudo
  export interface FirstChild extends PseudoClassSelector<"first-child"> {}

  // https://www.w3.org/TR/selectors/#last-child-pseudo
  export interface LastChild extends PseudoClassSelector<"last-child"> {}

  // https://www.w3.org/TR/selectors/#only-child-pseudo
  export interface OnlyChild extends PseudoClassSelector<"only-child"> {}

  // https://www.w3.org/TR/selectors/#first-of-type-pseudo
  export interface FirstOfType extends PseudoClassSelector<"first-of-type"> {}

  // https://www.w3.org/TR/selectors/#last-of-type-pseudo
  export interface LastOfType extends PseudoClassSelector<"last-of-type"> {}

  // https://www.w3.org/TR/selectors/#only-of-type-pseudo
  export interface OnlyOfType extends PseudoClassSelector<"only-of-type"> {}

  // https://www.w3.org/TR/selectors/#nth-child-pseudo
  export interface NthChild
    extends PseudoClassSelector<"nth-child">,
      WithChildIndex {}

  // https://www.w3.org/TR/selectors/#nth-last-child-pseudo
  export interface NthLastChild
    extends PseudoClassSelector<"nth-last-child">,
      WithChildIndex {}

  // https://www.w3.org/TR/selectors/#nth-of-type-pseudo
  export interface NthOfType
    extends PseudoClassSelector<"nth-of-type">,
      WithChildIndex {}

  // https://www.w3.org/TR/selectors/#nth-last-of-type-pseudo
  export interface NthLastOfType
    extends PseudoClassSelector<"nth-last-of-type">,
      WithChildIndex {}

  // https://www.w3.org/TR/selectors/#nth-col-pseudo
  export interface NthCol
    extends PseudoClassSelector<"nth-col">,
      WithChildIndex {}

  // https://www.w3.org/TR/selectors/#nth-last-col-pseudo
  export interface NthLastCol
    extends PseudoClassSelector<"nth-last-col">,
      WithChildIndex {}
}

export type PseudoClassSelector =
  | PseudoClassSelector.Is
  | PseudoClassSelector.Not
  | PseudoClassSelector.Has
  | PseudoClassSelector.Dir
  | PseudoClassSelector.Lang
  | PseudoClassSelector.AnyLink
  | PseudoClassSelector.Link
  | PseudoClassSelector.Visited
  | PseudoClassSelector.LocalLink
  | PseudoClassSelector.Target
  | PseudoClassSelector.TargetWithin
  | PseudoClassSelector.Scope
  | PseudoClassSelector.Hover
  | PseudoClassSelector.Active
  | PseudoClassSelector.Focus
  | PseudoClassSelector.FocusVisible
  | PseudoClassSelector.FocusWithin
  | PseudoClassSelector.Current
  | PseudoClassSelector.Past
  | PseudoClassSelector.Future
  | PseudoClassSelector.Playing
  | PseudoClassSelector.Paused
  | PseudoClassSelector.Enabled
  | PseudoClassSelector.Disabled
  | PseudoClassSelector.ReadOnly
  | PseudoClassSelector.ReadWrite
  | PseudoClassSelector.PlaceholderShown
  | PseudoClassSelector.Default
  | PseudoClassSelector.Checked
  | PseudoClassSelector.Valid
  | PseudoClassSelector.Invalid
  | PseudoClassSelector.InRange
  | PseudoClassSelector.OutOfRange
  | PseudoClassSelector.Required
  | PseudoClassSelector.UserInvalid
  | PseudoClassSelector.Host
  | PseudoClassSelector.HostContext
  | PseudoClassSelector.Root
  | PseudoClassSelector.Empty
  | PseudoClassSelector.Blank
  | PseudoClassSelector.FirstChild
  | PseudoClassSelector.LastChild
  | PseudoClassSelector.OnlyChild
  | PseudoClassSelector.FirstOfType
  | PseudoClassSelector.LastOfType
  | PseudoClassSelector.Indetermine
  | PseudoClassSelector.OnlyOfType
  | PseudoClassSelector.NthChild
  | PseudoClassSelector.NthLastChild
  | PseudoClassSelector.NthOfType
  | PseudoClassSelector.NthLastChild
  | PseudoClassSelector.NthLastOfType
  | PseudoClassSelector.NthCol
  | PseudoClassSelector.NthLastCol;

export type PseudoClass = PseudoClassSelector["name"];

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-elements
 */
export namespace PseudoElementSelector {
  interface PseudoElementSelector<T extends string> {
    readonly type: SelectorType.PseudoElementSelector;
    readonly name: T;
  }

  // https://www.w3.org/TR/css-pseudo/#first-line-pseudo
  export interface FirstLine extends PseudoElementSelector<"first-line"> {}

  // https://www.w3.org/TR/css-pseudo/#first-letter-pseudo
  export interface FirstLetter extends PseudoElementSelector<"first-letter"> {}

  // https://www.w3.org/TR/css-pseudo/#highlight-pseudos
  export interface Selection extends PseudoElementSelector<"selection"> {}

  export interface InactiveSelection
    extends PseudoElementSelector<"inactive-selection"> {}

  export interface SpellingError
    extends PseudoElementSelector<"spelling-error"> {}

  export interface GrammarError
    extends PseudoElementSelector<"grammar-error"> {}

  // https://www.w3.org/TR/css-pseudo/#generated-content
  export interface Before extends PseudoElementSelector<"before"> {}

  export interface After extends PseudoElementSelector<"after"> {}

  // https://www.w3.org/TR/css-pseudo/#marker-pseudo
  export interface Marker extends PseudoElementSelector<"marker"> {}

  // https://www.w3.org/TR/css-pseudo/#placeholder-pseudo
  export interface Placeholder extends PseudoElementSelector<"placeholder"> {}
}

export type PseudoElementSelector =
  | PseudoElementSelector.FirstLine
  | PseudoElementSelector.FirstLetter
  | PseudoElementSelector.Selection
  | PseudoElementSelector.InactiveSelection
  | PseudoElementSelector.SpellingError
  | PseudoElementSelector.GrammarError
  | PseudoElementSelector.Before
  | PseudoElementSelector.After
  | PseudoElementSelector.Marker
  | PseudoElementSelector.Placeholder;

export type PseudoElement = PseudoElementSelector["name"];

export interface ChildIndex {
  readonly step: number;
  readonly offset: number;
}

export const enum MediaQualifier {
  Only,
  Not
}

export const enum MediaOperator {
  Not,
  And,
  Or
}

export const enum MediaComparator {
  GreaterThan,
  GreaterThanEqual,
  LessThan,
  LessTahnEqual
}

export type MediaType = string;

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-query
 */
export interface MediaQuery {
  readonly qualifier?: MediaQualifier;
  readonly type?: MediaType;
  readonly condition?: MediaCondition;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-condition
 */
export interface MediaCondition {
  readonly operator?: MediaOperator;
  readonly features: Array<MediaFeature | MediaCondition>;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-feature
 */
export interface MediaFeature {
  readonly name: string;
  readonly value?: MediaFeatureValue;
  readonly comparator?: MediaComparator;
}

export type MediaFeatureValue =
  | Values.Number
  | Values.Percentage
  | Values.Length
  | Values.String;
