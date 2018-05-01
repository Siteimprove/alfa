import { memoize, indexOf, isWhitespace, split, first } from "@alfa/util";
import {
  Selector,
  SelectorList,
  RelativeSelector,
  TypeSelector,
  ClassSelector,
  IdSelector,
  AttributeSelector,
  CompoundSelector,
  CssTree,
  parse
} from "@alfa/css";
import { Node, Element } from "./types";
import { isElement } from "./guards";
import { getAttribute } from "./get-attribute";
import { getClassList } from "./get-class-list";
import { getTag } from "./get-tag";
import { getParent } from "./get-parent";

const parseMemoized = memoize(parse, { cache: { size: 50 } });

export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | SelectorList
): boolean {
  let parsed: CssTree | null = null;

  try {
    parsed = typeof selector === "string" ? parseMemoized(selector) : selector;
  } catch (err) {
    throw new Error(`Invalid selector: ${selector}`);
  }

  if (parsed === null) {
    return false;
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
      return matchesCompound(element, context, parsed);
    case "selector-list":
      return matchesList(element, context, parsed);
    case "relative-selector":
      return matchesRelative(element, context, parsed);
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

  return getTag(element) === selector.name;
}

/**
 * @see https://www.w3.org/TR/selectors/#attribute-selectors
 */
function matchesAttribute(
  element: Element,
  selector: AttributeSelector
): boolean {
  const value = getAttribute(element, selector.name);

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
    case "^":
      return value.startsWith(selector.value);
    case "$":
      return value.endsWith(selector.value);
    case "*":
      return value.includes(selector.value);
    case "~":
      return split(value, isWhitespace).some(value => selector.value === value);
    case "|":
      return selector.value === value || value.startsWith(selector.value + "-");
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#compound
 */
function matchesCompound(
  element: Element,
  context: Node,
  selector: CompoundSelector
): boolean {
  return selector.selectors.every(selector =>
    matches(element, context, selector)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#grouping
 */
function matchesList(
  element: Element,
  context: Node,
  selector: SelectorList
): boolean {
  return selector.selectors.some(selector =>
    matches(element, context, selector)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#combinators
 */
function matchesRelative(
  element: Element,
  context: Node,
  selector: RelativeSelector
): boolean {
  if (!matches(element, context, selector.selector)) {
    return false;
  }

  switch (selector.combinator) {
    case " ":
      return matchesDescendant(element, context, selector);
    case ">":
      return matchesDirectDescendant(element, context, selector);
    case "~":
      return matchesSibling(element, context, selector);
    case "+":
      return matchesDirectSibling(element, context, selector);
  }
}

/**
 * @see https://www.w3.org/TR/selectors/#descendant-combinators
 */
function matchesDescendant(
  element: Element,
  context: Node,
  selector: RelativeSelector
): boolean {
  let parent: Node | null = getParent(element, context);

  while (parent !== null && isElement(parent)) {
    if (matches(parent, context, selector.relative)) {
      return true;
    }

    parent = getParent(parent, context);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#child-combinators
 */
function matchesDirectDescendant(
  element: Element,
  context: Node,
  selector: RelativeSelector
): boolean {
  const parent = getParent(element, context);
  return (
    parent !== null &&
    isElement(parent) &&
    matches(parent, context, selector.relative)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#general-sibling-combinators
 */
function matchesSibling(
  element: Element,
  context: Node,
  selector: RelativeSelector
): boolean {
  const parent = getParent(element, context);

  if (parent === null) {
    return false;
  }

  const { childNodes } = parent;

  for (let i = indexOf(childNodes, element) - 1; i >= 0; i--) {
    const sibling = childNodes[i];

    if (isElement(sibling) && matches(sibling, context, selector.relative)) {
      return true;
    }
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#adjacent-sibling-combinators
 */
function matchesDirectSibling(
  element: Element,
  context: Node,
  selector: RelativeSelector
): boolean {
  const parent = getParent(element, context);

  if (parent === null) {
    return false;
  }

  const { childNodes } = parent;

  const sibling = childNodes[indexOf(childNodes, element) - 1];

  if (sibling === undefined || !isElement(sibling)) {
    return false;
  }

  return matches(sibling, context, selector.relative);
}
