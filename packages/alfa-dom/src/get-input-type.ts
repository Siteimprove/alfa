import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export type InputType =
  | "hidden"
  | "text"
  | "search"
  | "tel"
  | "url"
  | "email"
  | "password"
  | "date"
  | "month"
  | "time"
  | "datetime-local"
  | "number"
  | "range"
  | "color"
  | "checkbox"
  | "radio"
  | "file"
  | "submit"
  | "image"
  | "reset"
  | "button"
  | "week";

/**
 * @see https://www.w3.org/TR/html5/sec-forms.html#element-attrdef-input-type
 */
export function getInputType(element: Element): InputType | null {
  if (element.localName !== "input") {
    return null;
  }

  // The `type` attribute of is an enumerated attribute and is therefore case-
  // insensitive.
  // https://www.w3.org/TR/html/infrastructure.html#enumerated-attributes
  const type = getAttribute(element, "type", { lowerCase: true });

  if (type !== null) {
    switch (type) {
      case "hidden":
      case "text":
      case "search":
      case "tel":
      case "url":
      case "email":
      case "password":
      case "date":
      case "month":
      case "time":
      case "datetime-local":
      case "number":
      case "range":
      case "color":
      case "checkbox":
      case "radio":
      case "file":
      case "submit":
      case "image":
      case "reset":
      case "button":
      case "week":
        return type;
    }
  }

  return null;
}
