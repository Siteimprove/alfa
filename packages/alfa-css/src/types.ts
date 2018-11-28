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

export interface PseudoClassSelector {
  readonly type: SelectorType.PseudoClassSelector;
  readonly name: PseudoClass;
  readonly value: Selector | Array<Selector> | AnBMicrosyntax | null;
}

export interface PseudoElementSelector {
  readonly type: SelectorType.PseudoElementSelector;
  readonly name: PseudoElement;
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
  // https://drafts.csswg.org/css-scoping/#host-selector
  | "host"
  // https://drafts.csswg.org/css-scoping/#host-selector
  | "host-context"
  // https://www.w3.org/TR/selectors/#root-pseudo
  | "root"
  // https://www.w3.org/TR/selectors/#empty-pseudo
  | "empty"
  // https://www.w3.org/TR/selectors/#blank-pseudo
  | "blank"
  // https://www.w3.org/TR/selectors/#first-child-pseudo
  | "first-child"
  // https://www.w3.org/TR/selectors/#last-child-pseudo
  | "last-child"
  // https://www.w3.org/TR/selectors/#only-child-pseudo
  | "only-child"
  // https://www.w3.org/TR/selectors/#first-of-type-pseudo
  | "first-of-type"
  // https://www.w3.org/TR/selectors/#last-of-type-pseudo
  | "last-of-type"
  // https://www.w3.org/TR/selectors/#only-of-type-pseudo
  | "only-of-type"
  // https://www.w3.org/TR/selectors/#child-index
  | ChildIndexedPseudoClass;

type ChildIndexedPseudoClass =
  // https://www.w3.org/TR/selectors/#nth-child-pseudo
  | "nth-child"
  // https://www.w3.org/TR/selectors/#nth-last-child-pseudo
  | "nth-last-child"
  // https://www.w3.org/TR/selectors/#nth-of-type-pseudo
  | "nth-of-type"
  // https://www.w3.org/TR/selectors/#nth-last-of-type-pseudo
  | "nth-last-of-type"
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

export interface AnBMicrosyntax {
  readonly a: number;
  readonly b: number;
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
