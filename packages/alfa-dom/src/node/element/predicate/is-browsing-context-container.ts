import { Element } from "../../element";

/**
 * @see https://html.spec.whatwg.org/#browsing-context-container
 */
export function isBrowsingContextContainer(element: Element): boolean {
  switch (element.name) {
    // <iframe> elements are _always_ browsing context containers as they will
    // _always_ have a content document, although it might be empty.
    case "iframe":
      return true;

    // <object> elements are only browsing context containers if they have a
    // content document.
    case "object":
      return element.content.isSome();

    default:
      return false;
  }
}
