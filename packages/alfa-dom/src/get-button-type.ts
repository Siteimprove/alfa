import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export type ButtonType = "submit" | "reset" | "button";

/**
 * @see https://www.w3.org/TR/html/sec-forms.html#element-attrdef-button-type
 */
export function getButtonType(element: Element): ButtonType | null {
  if (element.localName !== "button") {
    return null;
  }

  // The `type` attribute of is an enumerated attribute and is therefore case-
  // insensitive.
  // https://www.w3.org/TR/html/infrastructure.html#enumerated-attributes
  const type = getAttribute(element, "type", { lowerCase: true });

  if (type !== null) {
    switch (type) {
      case "submit":
      case "reset":
      case "button":
        return type;
    }
  }

  return null;
}
