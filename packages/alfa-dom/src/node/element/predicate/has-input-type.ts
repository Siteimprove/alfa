import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

const { equals } = Predicate;

/**
 * @see https://html.spec.whatwg.org/#attr-input-type
 */
type InputType =
  | "hidden"
  | "search"
  | "tel"
  | "url"
  | "email"
  | "password"
  | "date"
  | "month"
  | "week"
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
  | "text";

export function hasInputType(
  predicate: Predicate<InputType>
): Predicate<Element>;

export function hasInputType(
  inputType: InputType,
  ...rest: Array<InputType>
): Predicate<Element>;

export function hasInputType(
  inputTypeOrPredicate: InputType | Predicate<InputType>,
  ...inputTypes: Array<InputType>
): Predicate<Element> {
  let predicate: Predicate<InputType>;

  if (typeof inputTypeOrPredicate === "function") {
    predicate = inputTypeOrPredicate;
  } else {
    predicate = equals(inputTypeOrPredicate, ...inputTypes);
  }
  return (element) => {
    if (element.name !== "input") {
      return false;
    }

    return predicate(
      element
        .attribute("type")
        .flatMap((attribute) =>
          attribute.enumerate(
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
        )
        .getOr("text")
    );
  };
}
