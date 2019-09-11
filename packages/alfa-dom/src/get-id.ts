import { Cache } from "@siteimprove/alfa-util";
import { getAttribute } from "./get-attribute";
import { Element } from "./types";

const ids = Cache.of<Element, string | null>();

/**
 * Given an element, get the ID of the element.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-id
 */
export function getId(element: Element): string | null {
  return ids.get(element, () => getAttribute(element, "id"));
}
