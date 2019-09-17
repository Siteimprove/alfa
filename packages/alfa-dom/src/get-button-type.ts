import { getAttribute } from "./get-attribute";
import { Element } from "./types";

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
export function getButtonType(element: Element): ButtonType | null {
  if (element.localName !== "button") {
    return null;
  }

  // The `type` attribute of is an enumerated attribute and is therefore case-
  // insensitive.
  // https://html.spec.whatwg.org/#enumerated-attribute
  const type = getAttribute(element, "type", { lowerCase: true });

  switch (type) {
    case "submit":
    default:
      return ButtonType.Submit;
    case "reset":
      return ButtonType.Reset;
    case "button":
      return ButtonType.Button;
  }
}
