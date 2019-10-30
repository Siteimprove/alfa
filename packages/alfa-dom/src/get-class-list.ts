import { Cache } from "@siteimprove/alfa-cache";
import { getAttribute } from "./get-attribute";
import { Element, Node } from "./types";

const whitespace = /\s+/;

const empty: Readonly<Array<string>> = [];

const cache = Cache.empty<Element, Iterable<string>>();

/**
 * Given an element, get the class list of the element.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-classlist
 *
 * @example
 * const div = <div class="foo bar" />;
 * getClassList(div, div);
 * // => ["foo", "bar"]
 */
export function getClassList(
  element: Element,
  context: Node
): Iterable<string> {
  return cache.get(element, () =>
    getAttribute(element, context, "class")
      .map(classList => classList.trim().split(whitespace))
      .getOr(empty)
  );
}
