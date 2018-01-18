import { Selector, SelectorList, RelativeSelector, parse } from "@alfa/css";
import { memoize } from "@alfa/util";
import { Element, ParentNode } from "../types";
import { isElement } from "../guards";
import { attribute } from "./attribute";
import { classlist } from "./classlist";

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
      return element.tag === parsed.name;

    case "class-selector":
      return classlist(element).has(parsed.name);

    case "id-selector":
      return attribute(element, "id") === parsed.name;

    case "compound-selector":
      return parsed.selectors.every(selector => matches(element, selector));

    case "selector-list":
      return parsed.selectors.some(selector => matches(element, selector));

    case "relative-selector": {
      let { parent } = element;

      if (!matches(element, parsed.selector) || !isElement(parent)) {
        return false;
      }

      switch (parsed.combinator) {
        case ">":
          return matches(parent, parsed.relative);

        case ">>":
          do {
            if (matches(parent, parsed.relative)) {
              return true;
            }

            parent = parent.parent;
          } while (isElement(parent));

          return false;

        case "+":
          const sibling = parent.children[parent.children.indexOf(element) - 1];

          if (sibling === undefined || !isElement(sibling)) {
            return false;
          }

          return matches(sibling, parsed.relative);

        case "~":
          for (let i = parent.children.indexOf(element) - 1; i >= 0; i--) {
            const sibling = parent.children[i];

            if (isElement(sibling) && matches(sibling, parsed.relative)) {
              return true;
            }
          }

          return false;
      }
    }
  }

  return false;
}
