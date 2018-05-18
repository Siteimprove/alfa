import { memoize, isWhitespace, split, first } from "@siteimprove/alfa-util";
import { parse, lex } from "@siteimprove/alfa-lang";
import {
  Alphabet,
  SelectorGrammar,
  Selector,
  RelativeSelector,
  TypeSelector,
  ClassSelector,
  IdSelector,
  AttributeSelector,
  CompoundSelector,
  PseudoClassSelector
} from "@siteimprove/alfa-css";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { getAttribute } from "./get-attribute";
import { getClassList } from "./get-class-list";
import { getParentNode } from "./get-parent-node";
import { getPreviousSibling } from "./get-previous-sibling";
import { AncestorFilter } from "./ancestor-filter";

const { isArray } = Array;

const parseMemoized = memoize(
  (selector: string) => parse(lex(selector, Alphabet), SelectorGrammar),
  { cache: { size: 50 } }
);

export type MatchingOptions = Readonly<{
  /**
   * @see https://www.w3.org/TR/selectors/#scope-element
   */
  scope?: Node;

  /**
   * Ancestor filter used for fast-rejecting elements during selector matching.
   * This option is only available to internal methods as the ancestor filter is
   * not exposed externally.
   *
   * @internal
   */
  filter?: AncestorFilter;
}>;

export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options: MatchingOptions = {}
): boolean {
  let parsed: Selector | Array<Selector> | null = null;

  try {
    parsed = typeof selector === "string" ? parseMemoized(selector) : selector;
  } catch (err) {
    throw new Error(`Invalid selector: ${selector}`);
  }

  if (parsed === null) {
    return false;
  }

  if (isArray(parsed)) {
    return matchesList(element, context, parsed, options);
  }

  switch (parsed.type) {
    case "id-selector":
      return matchesId(element, parsed);
    case "class-selector":
      return matchesClass(element, parsed);
    case "type-selector":
      return matchesType(element, parsed);
    case "attribute-selector":
      return matchesAttribute(element, parsed);
    case "compound-selector":
      return matchesCompound(element, context, parsed, options);
    case "relative-selector":
      return matchesRelative(element, context, parsed, options);
    case "pseudo-class-selector":
      return matchesPseudoClass(element, context, parsed, options);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#id-selectors
 */
function matchesId(element: Element, selector: IdSelector): boolean {
  return getAttribute(element, "id") === selector.name;
}

/**
 * @see https://www.w3.org/TR/selectors/#class-html
 */
function matchesClass(element: Element, selector: ClassSelector): boolean {
  return getClassList(element).has(selector.name);
}

/**
 * @see https://www.w3.org/TR/selectors/#type-selectors
 */
function matchesType(element: Element, selector: TypeSelector): boolean {
  // https://www.w3.org/TR/selectors/#the-universal-selector
  if (selector.name === "*") {
    return true;
  }

  return element.localName === selector.name;
}

/**
 * @see https://www.w3.org/TR/selectors/#attribute-selectors
 */
function matchesAttribute(
  element: Element,
  selector: AttributeSelector
): boolean {
  let value = getAttribute(element, selector.name);

  if (selector.value === null) {
    return value !== null;
  }

  if (value === null) {
    return false;
  }

  let match = selector.value;

  if (selector.modifier === "i") {
    value = value.toLowerCase();
    match = match.toLowerCase();
  }

  if (selector.matcher === null) {
    return selector.value === value;
  }

  switch (selector.matcher) {
    case "^":
      return value.startsWith(match);
    case "$":
      return value.endsWith(match);
    case "*":
      return value.includes(match);
    case "~":
      return split(value, isWhitespace).some(value => value === match);
    case "|":
      return value === match || value.startsWith(match + "-");
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#compound
 */
function matchesCompound(
  element: Element,
  context: Node,
  selector: CompoundSelector,
  options: MatchingOptions
): boolean {
  return selector.selectors.every(selector =>
    matches(element, context, selector, options)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#grouping
 */
function matchesList(
  element: Element,
  context: Node,
  selectors: Array<Selector>,
  options: MatchingOptions
): boolean {
  return selectors.some(selector =>
    matches(element, context, selector, options)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#combinators
 */
function matchesRelative(
  element: Element,
  context: Node,
  selector: RelativeSelector,
  options: MatchingOptions
): boolean {
  if (options.filter !== undefined && canReject(selector, options.filter)) {
    return false;
  }

  if (!matches(element, context, selector.selector, options)) {
    return false;
  }

  const { combinator, relative } = selector;

  switch (combinator) {
    case " ":
      return matchesDescendant(element, context, relative, options);
    case ">":
      return matchesDirectDescendant(element, context, relative, options);
    case "~":
      return matchesSibling(element, context, relative, options);
    case "+":
      return matchesDirectSibling(element, context, relative, options);
  }
}

/**
 * @see https://www.w3.org/TR/selectors/#descendant-combinators
 */
function matchesDescendant(
  element: Element,
  context: Node,
  selector: Selector,
  options: MatchingOptions
): boolean {
  let parentNode = getParentNode(element, context);

  while (parentNode !== null) {
    if (isElement(parentNode)) {
      if (matches(parentNode, context, selector, options)) {
        return true;
      }
    }

    parentNode = getParentNode(parentNode, context);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#child-combinators
 */
function matchesDirectDescendant(
  element: Element,
  context: Node,
  selector: Selector,
  options: MatchingOptions
): boolean {
  let parentNode = getParentNode(element, context);

  while (parentNode !== null) {
    if (isElement(parentNode)) {
      if (matches(parentNode, context, selector, options)) {
        return true;
      }

      return false;
    }

    parentNode = getParentNode(parentNode, context);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#general-sibling-combinators
 */
function matchesSibling(
  element: Element,
  context: Node,
  selector: Selector,
  options: MatchingOptions
): boolean {
  let previousSibling = getPreviousSibling(element, context);

  while (previousSibling !== null) {
    if (isElement(previousSibling)) {
      if (matches(previousSibling, context, selector, options)) {
        return true;
      }
    }

    previousSibling = getPreviousSibling(previousSibling, context);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#adjacent-sibling-combinators
 */
function matchesDirectSibling(
  element: Element,
  context: Node,
  selector: Selector,
  options: MatchingOptions
): boolean {
  let previousSibling = getPreviousSibling(element, context);

  while (previousSibling !== null) {
    if (isElement(previousSibling)) {
      if (matches(previousSibling, context, selector, options)) {
        return true;
      }

      return false;
    }

    previousSibling = getPreviousSibling(previousSibling, context);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-classes
 */
function matchesPseudoClass(
  element: Element,
  context: Node,
  selector: PseudoClassSelector,
  options: MatchingOptions
): boolean {
  switch (selector.name) {
    // https://www.w3.org/TR/selectors/#scope-pseudo
    case "scope":
      return options.scope === element;
    // https://www.w3.org/TR/selectors/#negation-pseudo
    case "not":
      if (selector.value === null) {
        return true;
      }

      return !matches(element, context, selector.value, options);
    // https://www.w3.org/TR/selectors/#hover-pseudo
    case "hover":
    // https://www.w3.org/TR/selectors/#active-pseudo
    case "active":
    // https://www.w3.org/TR/selectors/#focus-pseudo
    case "focus":
      return false;
  }

  return false;
}

/**
 * Check if a selector can be rejected based on an ancestor filter.
 */
function canReject(selector: Selector, filter: AncestorFilter): boolean {
  while (true) {
    switch (selector.type) {
      case "id-selector":
      case "class-selector":
      case "type-selector":
        return !filter.matches(selector);
      case "relative-selector":
        const { combinator } = selector;
        if (combinator === " " || combinator === ">") {
          selector = selector.relative;
          continue;
        }
    }

    return false;
  }
}
