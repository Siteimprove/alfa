import {
  Selector,
  RelativeSelector,
  TypeSelector,
  ClassSelector,
  IdSelector,
  AttributeSelector,
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
    case "id-selector":
      return matchesId(element, selector);
    case "class-selector":
      return matchesClass(element, selector);
    case "type-selector":
      return matchesType(element, selector);
    case "attribute-selector":
      return matchesAttribute(element, selector);
    case "compound-selector":
      return matchesCompound(element, context, selector, options);
    case "relative-selector":
      return matchesRelative(element, context, selector, options);
    case "pseudo-class-selector":
      return matchesPseudoClass(element, context, selector, options);
    case "pseudo-element-selector":
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
  let value = getAttribute(element, selector.name);

  if (selector.value === null) {
    return value !== null;
  }

  if (value === null) {
    return false;
  }

  if (selector.modifier === "i") {
    value = value.toLowerCase();
  }

  if (selector.matcher === null) {
    return selector.value === value;
  }

  switch (selector.matcher) {
    case "^":
      return value.startsWith(selector.value);
    case "$":
      return value.endsWith(selector.value);
    case "*":
      return value.includes(selector.value);
    case "~":
      return value.split(whitespace).some(value => value === selector.value);
    case "|":
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
  if (options.filter !== undefined && canReject(selector, options.filter)) {
    return false;
  }

  if (!matches(element, context, selector.right, options)) {
    return false;
  }

  switch (selector.combinator) {
    case " ":
      return matchesDescendant(element, context, selector.left, options);
    case ">":
      return matchesDirectDescendant(element, context, selector.left, options);
    case "~":
      return matchesSibling(element, context, selector.left, options);
    case "+":
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
    case "id-selector":
    case "class-selector":
    case "type-selector":
      return !filter.matches(selector);

    case "relative-selector":
      switch (selector.combinator) {
        case " ":
        case ">":
          return canReject(selector.left, filter);
      }
  }

  return false;
}
