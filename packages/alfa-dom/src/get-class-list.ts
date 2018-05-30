import { Element } from "./types";
import { getAttribute } from "./get-attribute";

const whitespace = /\s+/;

const empty: ReadonlyArray<string> = [];

const classLists: WeakMap<Element, ReadonlyArray<string>> = new WeakMap();

/**
 * Given an element, get the associated class list of an element.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-classlist
 *
 * @example
 * const div = <div class="foo bar" />;
 * getClassList(div);
 * // => ["foo", "bar"]
 */
export function getClassList(element: Element): ReadonlyArray<string> {
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
