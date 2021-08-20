import { Element } from "../../element";

/**
 * {@link https://html.spec.whatwg.org/#editing-host}
 *
 * @public
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
