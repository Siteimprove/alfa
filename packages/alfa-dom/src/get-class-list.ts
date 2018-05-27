import { Element } from "./types";
import { getAttribute } from "./get-attribute";

const whitespace = /\s+/;

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
export function getClassList(element: Element): Array<string> {
  const classNames = getAttribute(element, "class");

  if (classNames === null) {
    return [];
  }

  return classNames.split(whitespace);
}
