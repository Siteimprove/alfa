import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";
import { getAttribute } from "./get-attribute";
import { Element, Node } from "./types";

const cache = Cache.empty<Element, Option<string>>();

/**
 * Given an element, get the ID of the element.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-id
 */
export function getId(element: Element, context: Node): Option<string> {
  return cache.get(element, () => getAttribute(element, context, "id"));
}
