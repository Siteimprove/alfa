import {
  Selector,
  SelectorType,
  SelectorCombinator,
  RelativeSelector,
  TypeSelector,
  ClassSelector,
  IdSelector,
  AttributeSelector,
  AttributeMatcher,
  AttributeModifier,
  CompoundSelector,
  PseudoClassSelector,
  PseudoElementSelector,
  parseSelector
} from "@siteimprove/alfa-css";
import { Node, Element } from "./types";
import { contains } from "./contains";
import { getId } from "./get-id";
import { getAttribute } from "./get-attribute";
import { getParentElement } from "./get-parent-element";
import { getPreviousElementSibling } from "./get-previous-element-sibling";
import { hasClass } from "./has-class";
import { AncestorFilter } from "./ancestor-filter";

const { isArray } = Array;

/**
 * @internal
 */
export type MatchingOptions = Readonly<{
  /**
   * @see https://www.w3.org/TR/selectors/#scope-element
   */
  scope?: Element;

  /**
   * @see https://www.w3.org/TR/selectors/#the-hover-pseudo
   */
  hover?: Element | boolean;

  /**
   * @see https://www.w3.org/TR/selectors/#the-active-pseudo
   */
  active?: Element | boolean;

  /**
   * @see https://www.w3.org/TR/selectors/#the-focus-pseudo
   */
  focus?: Element | boolean;

  /**
   * Whether or not to perform selector matching against pseudo-elements.
   *
   * @see https://www.w3.org/TR/selectors/#pseudo-elements
   */
  pseudo?: boolean;

  /**
   * Ancestor filter used for fast-rejecting elements during selector matching.
   */
  filter?: AncestorFilter;
}>;

/**
 * @see https://www.w3.org/TR/dom41/#dom-element-matches
 */
export function matches(
  element: Element,
  context: Node,
  selector: string
): boolean;

/**
 * @internal
 */
export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options?: MatchingOptions
): boolean;

export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options: MatchingOptions = {}
): boolean {
  if (typeof selector === "string") {
    const parsed = parseSelector(selector);

    if (parsed === null) {
      return false;
    }

    selector = parsed;
  }

  if (isArray(selector)) {
    for (let i = 0, n = selector.length; i < n; i++) {
      if (matches(element, context, selector[i], options)) {
        return true;
      }
    }

    return false;
  }

  switch (selector.type) {
    case SelectorType.IdSelector:
      return matchesId(element, selector);

    case SelectorType.ClassSelector:
      return matchesClass(element, selector);

    case SelectorType.TypeSelector:
      return matchesType(element, selector);

    case SelectorType.AttributeSelector:
      return matchesAttribute(element, selector);

    case SelectorType.CompoundSelector:
      return matchesCompound(element, context, selector, options);

    case SelectorType.RelativeSelector:
      return matchesRelative(element, context, selector, options);

    case SelectorType.PseudoClassSelector:
      return matchesPseudoClass(element, context, selector, options);

    case SelectorType.PseudoElementSelector:
      return matchesPseudoElement(element, context, selector, options);
  }
}

/**
 * @see https://www.w3.org/TR/selectors/#id-selectors
 */
function matchesId(element: Element, selector: IdSelector): boolean {
  return getId(element) === selector.name;
}

/**
 * @see https://www.w3.org/TR/selectors/#class-html
 */
function matchesClass(element: Element, selector: ClassSelector): boolean {
  return hasClass(element, selector.name);
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

const whitespace = /\s+/;

/**
 * @see https://www.w3.org/TR/selectors/#attribute-selectors
 */
function matchesAttribute(
  element: Element,
  selector: AttributeSelector
): boolean {
  const value = getAttribute(element, selector.name, {
    lowerCase: (selector.modifier & AttributeModifier.CaseInsensitive) > 0
  });

  if (selector.value === null) {
    return value !== null;
  }

  if (value === null) {
    return false;
  }

  if (selector.matcher === null) {
    return selector.value === value;
  }

  switch (selector.matcher) {
    case AttributeMatcher.Prefix:
      return value.startsWith(selector.value);

    case AttributeMatcher.Suffix:
      return value.endsWith(selector.value);

    case AttributeMatcher.Substring:
      return value.includes(selector.value);

    case AttributeMatcher.Includes:
      return value.split(whitespace).some(value => value === selector.value);

    case AttributeMatcher.DashMatch:
      return value === selector.value || value.startsWith(selector.value + "-");
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
  if (!matches(element, context, selector.left, options)) {
    return false;
  }

  return matches(element, context, selector.right, options);
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
  // Before any other work is done, check if the left part of the selector can
  // be rejected by the ancestor filter optionally passed to `matches()`. Only
  // descendant and direct-descendant selectors can potentially be rejected.
  if (options.filter !== undefined) {
    switch (selector.combinator) {
      case SelectorCombinator.Descendant:
      case SelectorCombinator.DirectDescendant:
        if (canReject(selector.left, options.filter)) {
          return false;
        }

        // If the selector cannot be rejected, unset the ancestor filter as it
        // no longer applies when we start recursively moving up the tree.
        options = { ...options, filter: undefined };
    }
  }

  // Otherwise, make sure that the right part of the selector, i.e. the part
  // that relates to the current element, matches.
  if (!matches(element, context, selector.right, options)) {
    return false;
  }

  // If it does, move on the heavy part of the work: Looking either up the tree
  // for a descendant match or looking to the side of the tree for a sibling
  // match.
  switch (selector.combinator) {
    case SelectorCombinator.Descendant:
      return matchesDescendant(element, context, selector.left, options);

    case SelectorCombinator.DirectDescendant:
      return matchesDirectDescendant(element, context, selector.left, options);

    case SelectorCombinator.Sibling:
      return matchesSibling(element, context, selector.left, options);

    case SelectorCombinator.DirectSibling:
      return matchesDirectSibling(element, context, selector.left, options);
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
  let parentElement = getParentElement(element, context);

  while (parentElement !== null) {
    if (matches(parentElement, context, selector, options)) {
      return true;
    }

    parentElement = getParentElement(parentElement, context);
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
  let parentElement = getParentElement(element, context);

  if (parentElement === null) {
    return false;
  }

  return matches(parentElement, context, selector, options);
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
  let previousElementSibling = getPreviousElementSibling(element, context);

  while (previousElementSibling !== null) {
    if (matches(previousElementSibling, context, selector, options)) {
      return true;
    }

    previousElementSibling = getPreviousElementSibling(
      previousElementSibling,
      context
    );
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
  let previousElementSibling = getPreviousElementSibling(element, context);

  if (previousElementSibling === null) {
    return false;
  }

  return matches(previousElementSibling, context, selector, options);
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
      return (
        selector.value === null ||
        !matches(element, context, selector.value, options)
      );

    // https://www.w3.org/TR/selectors/#hover-pseudo
    case "hover":
      const { hover } = options;

      if (hover === undefined || hover === false) {
        return false;
      }

      return (
        hover === true || contains(element, context, hover, { composed: true })
      );

    // https://www.w3.org/TR/selectors/#active-pseudo
    case "active":
      const { active } = options;

      if (active === undefined || active === false) {
        return false;
      }

      return (
        active === true ||
        contains(element, context, active, { composed: true })
      );

    // https://www.w3.org/TR/selectors/#focus-pseudo
    case "focus":
      const { focus } = options;

      if (focus === undefined || focus === false) {
        return false;
      }

      return focus === true || element === focus;
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-elements
 */
function matchesPseudoElement(
  element: Element,
  context: Node,
  selector: PseudoElementSelector,
  options: MatchingOptions
): boolean {
  return options.pseudo === true;
}

/**
 * Check if a selector can be rejected based on an ancestor filter.
 */
function canReject(selector: Selector, filter: AncestorFilter): boolean {
  switch (selector.type) {
    case SelectorType.IdSelector:
    case SelectorType.ClassSelector:
    case SelectorType.TypeSelector:
      return !filter.matches(selector);

    case SelectorType.CompoundSelector:
      return (
        canReject(selector.left, filter) || canReject(selector.right, filter)
      );

    case SelectorType.RelativeSelector:
      const { combinator } = selector;
      if (
        combinator === SelectorCombinator.Descendant ||
        combinator === SelectorCombinator.DirectDescendant
      ) {
        return (
          canReject(selector.right, filter) || canReject(selector.left, filter)
        );
      }
  }

  return false;
}
