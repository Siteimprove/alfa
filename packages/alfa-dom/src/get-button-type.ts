import { None, Option } from "@siteimprove/alfa-option";
import { getAttribute } from "./get-attribute";
import { Element, Node } from "./types";

export const enum ButtonType {
  Submit,
  Reset,
  Button
}

/**
 * Given a `<button>` element, get the type of the element. If the element is
 * not a `<button>`, `null` is returned.
 *
 * @see https://html.spec.whatwg.org/#attr-button-type
 */
export function getButtonType(
  element: Element,
  context: Node
): Option<ButtonType> {
  if (element.localName !== "button") {
    return None;
  }

  return getAttribute(element, context, "type").map(type => {
    // The `type` attribute of is an enumerated attribute and is therefore case-
    // insensitive.
    // https://html.spec.whatwg.org/#enumerated-attribute
    switch (type.toLowerCase()) {
      case "submit":
      default:
        return ButtonType.Submit;
      case "reset":
        return ButtonType.Reset;
      case "button":
        return ButtonType.Button;
    }
  });
}
