import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasInputType(
  predicate: Predicate<string> = () => true
): Predicate<Element> {
  return (element) => {
    if (element.name !== "input") {
      return false;
    }

    const type = element
      .attribute("type")
      .map((attr) =>
        // The `type` attribute of is an enumerated attribute and is therefore
        // case-insensitive.
        // https://html.spec.whatwg.org/#enumerated-attribute
        attr.value.toLowerCase()
      )
      .getOr("text")
      .toLowerCase();

    switch (type) {
      case "hidden":
      case "search":
      case "tel":
      case "url":
      case "email":
      case "password":
      case "date":
      case "month":
      case "week":
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
      case "text":
        return predicate(type);
      default:
        return predicate("text");
    }
  };
}
