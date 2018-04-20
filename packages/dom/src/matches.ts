import { memoize } from "@alfa/util";
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
    case "type-selector":
      return matchesType(element, parsed);
    case "class-selector":
      return matchesClass(element, parsed);
    case "id-selector":
      return matchesId(element, parsed);
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

function matchesType(element: Element, selector: TypeSelector): boolean {
  return getTag(element) === selector.name;
}

function matchesClass(element: Element, selector: ClassSelector): boolean {
  return getClassList(element).has(selector.name);
}

function matchesId(element: Element, selector: IdSelector): boolean {
  return getAttribute(element, "id") === selector.name;
}

function matchesAttribute(
  element: Element,
  selector: AttributeSelector
): boolean {
  const value = getAttribute(element, selector.name);

  if (selector.value === null) {
    return value !== null;
  }

  return selector.value === value;
}

function matchesCompound(
  element: Element,
  context: Node,
  selector: CompoundSelector
): boolean {
  return selector.selectors.every(selector =>
    matches(element, context, selector)
  );
}

function matchesList(
  element: Element,
  context: Node,
  selector: SelectorList
): boolean {
  return selector.selectors.some(selector =>
    matches(element, context, selector)
  );
}

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

  for (let i = childNodes.indexOf(element) - 1; i >= 0; i--) {
    const sibling = childNodes[i];

    if (isElement(sibling) && matches(sibling, context, selector.relative)) {
      return true;
    }
  }

  return false;
}

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

  const sibling = childNodes[childNodes.indexOf(element) - 1];

  if (sibling === undefined || !isElement(sibling)) {
    return false;
  }

  return matches(sibling, context, selector.relative);
}
