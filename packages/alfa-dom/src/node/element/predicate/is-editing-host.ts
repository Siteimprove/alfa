import { Element } from "../../element";

/**
 * @see https://html.spec.whatwg.org/#editing-host
 */
export function isEditingHost(element: Element): boolean {
  return element
    .attribute("contenteditable")
    .flatMap((attribute) => attribute.enumerate("", "true", "false"))
    .some((contenteditable) => {
      switch (contenteditable) {
        case "":
        case "true":
          return true;

        case "false":
          return false;
      }
    });
}
