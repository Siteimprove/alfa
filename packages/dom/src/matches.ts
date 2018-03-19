import { memoize } from "@alfa/util";
import {
  Selector,
  SelectorList,
  RelativeSelector,
  TypeSelector,
  ClassSelector,
  IdSelector,
  CompoundSelector,
  parse
} from "@alfa/css";
import { Element, ParentNode } from "./types";
import { isElement } from "./guards";
import { getAttribute } from "./get-attribute";
import { getClasslist } from "./get-classlist";

const parseMemoized = memoize(parse, { cache: { size: 50 } });

export function matches(
  element: Element,
  selector: string | Selector | SelectorList
): boolean {
  const parsed =
    typeof selector === "string" ? parseMemoized(selector) : selector;

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
    case "compound-selector":
      return matchesCompound(element, parsed);
    case "selector-list":
      return matchesList(element, parsed);
    case "relative-selector":
      return matchesRelative(element, parsed);
  }

  return false;
}

function matchesType(element: Element, selector: TypeSelector): boolean {
  return element.tagName === selector.name;
}

function matchesClass(element: Element, selector: ClassSelector): boolean {
  return getClasslist(element).has(selector.name);
}

function matchesId(element: Element, selector: IdSelector): boolean {
  return getAttribute(element, "id") === selector.name;
}

function matchesCompound(
  element: Element,
  selector: CompoundSelector
): boolean {
  return selector.selectors.every(selector => matches(element, selector));
}

function matchesList(element: Element, selector: SelectorList): boolean {
  return selector.selectors.some(selector => matches(element, selector));
}

function matchesRelative(
  element: Element,
  selector: RelativeSelector
): boolean {
  if (!matches(element, selector.selector)) {
    return false;
  }

  switch (selector.combinator) {
    case " ":
      return matchesDescendant(element, selector);
    case ">":
      return matchesDirectDescendant(element, selector);
    case "~":
      return matchesSibling(element, selector);
    case "+":
      return matchesDirectSibling(element, selector);
  }
}

function matchesDescendant(
  element: Element,
  selector: RelativeSelector
): boolean {
  let { parentNode } = element;

  while (parentNode !== null && isElement(parentNode)) {
    if (matches(parentNode, selector.relative)) {
      return true;
    }

    parentNode = parentNode.parentNode;
  }

  return false;
}

function matchesDirectDescendant(
  element: Element,
  selector: RelativeSelector
): boolean {
  const { parentNode } = element;
  return (
    parentNode !== null &&
    isElement(parentNode) &&
    matches(parentNode, selector.relative)
  );
}

function matchesSibling(element: Element, selector: RelativeSelector): boolean {
  const { parentNode } = element;

  if (parentNode === null) {
    return false;
  }

  for (let i = parentNode.childNodes.indexOf(element) - 1; i >= 0; i--) {
    const sibling = parentNode.childNodes[i];

    if (isElement(sibling) && matches(sibling, selector.relative)) {
      return true;
    }
  }

  return false;
}

function matchesDirectSibling(
  element: Element,
  selector: RelativeSelector
): boolean {
  const { parentNode } = element;

  if (parentNode === null) {
    return false;
  }

  const sibling =
    parentNode.childNodes[parentNode.childNodes.indexOf(element) - 1];

  if (sibling === undefined || !isElement(sibling)) {
    return false;
  }

  return matches(sibling, selector.relative);
}
