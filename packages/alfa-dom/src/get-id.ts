import { getAttribute } from "./get-attribute";
import { Element } from "./types";

const ids: WeakMap<Element, string | null> = new WeakMap();

/**
 * @see https://www.w3.org/TR/dom/#dom-element-id
 */
export function getId(element: Element): string | null {
  let id = ids.get(element);

  if (id === undefined) {
    id = getAttribute(element, "id");
    ids.set(element, id);
  }

  return id;
}
