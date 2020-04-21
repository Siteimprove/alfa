import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasInputType(
  predicate: Predicate<string> = () => true
): Predicate<Element> {
  return (element) => {
    if (element.name !== "input") {
      return false;
    }

    return predicate(
      element
        .attribute("type")
        .map((attribute) =>
          attribute
            .enumerate(
              "hidden",
              "search",
              "tel",
              "url",
              "email",
              "password",
              "date",
              "month",
              "week",
              "time",
              "datetime-local",
              "number",
              "range",
              "color",
              "checkbox",
              "radio",
              "file",
              "submit",
              "image",
              "reset",
              "button",
              "text"
            )
            .getOr("text")
        )
        .getOr("text")
    );
  };
}
