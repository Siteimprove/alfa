import { Element } from "./types";
import { getAttribute } from "./get-attribute";
import { ObjectCache } from "./object-cache";

export interface ClassList extends Iterable<string> {
  has(className: string): boolean;
}

const classLists: ObjectCache<Element, ClassList> = new ObjectCache();

/**
 * Empty singleton set used for elements that have no class list.
 */
const empty: ClassList = new Set();

/**
 * Given an element, get the associated class list of an element.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-classlist
 *
 * @example
 * const div = <div class="foo bar" />;
 * ...getClassList(div);
 * // => ["foo", "bar"]
 */
export function getClassList(element: Element): ClassList {
  return classLists.get(element, () => {
    const classList = getAttribute(element, "class");

    if (classList === null) {
      return empty;
    }

    return new Set(classList.split(/\s+/));
  });
}
