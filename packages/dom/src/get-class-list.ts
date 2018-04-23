import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export interface ClassList extends Iterable<string> {
  has(className: string): boolean;
}

const classLists: WeakMap<Element, ClassList> = new WeakMap();

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
  let classList = classLists.get(element);

  if (classList === undefined) {
    classList = new Set((getAttribute(element, "class") || "").split(/\s+/));
    classLists.set(element, classList);
  }

  return classList;
}
