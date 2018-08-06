import { getAttribute } from "./get-attribute";
import { Element } from "./types";

const whitespace = /\s+/;

const empty: Array<string> = [];

const classLists: WeakMap<Element, Array<string>> = new WeakMap();

/**
 * Given an element, get the class list of the element.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-classlist
 *
 * @example
 * const div = <div class="foo bar" />;
 * getClassList(div);
 * // => ["foo", "bar"]
 */
export function getClassList(element: Element): ArrayLike<string> {
  let classList = classLists.get(element);

  if (classList === undefined) {
    const classNames = getAttribute(element, "class");

    if (classNames === null) {
      classList = empty;
    } else {
      classList = classNames.split(whitespace);
    }

    classLists.set(element, classList);
  }

  return classList;
}
