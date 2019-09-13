import { Cache } from "@siteimprove/alfa-util";
import { getAttribute } from "./get-attribute";
import { Element } from "./types";

const whitespace = /\s+/;

const empty: Readonly<Array<string>> = [];

const classLists = Cache.of<Element, Iterable<string>>();

/**
 * Given an element, get the class list of the element.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-classlist
 *
 * @example
 * const div = <div class="foo bar" />;
 * getClassList(div);
 * // => ["foo", "bar"]
 */
export function getClassList(element: Element): Iterable<string> {
  return classLists.get(element, () => {
    const classNames = getAttribute(element, "class", { trim: true });

    if (classNames === null) {
      return empty;
    }

    return classNames.split(whitespace);
  });
}
