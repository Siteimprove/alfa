import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element";
import { hasName } from "./has-name";

const { equals, test } = Predicate;
const { and } = Refinement;

/**
 * {@link https://html.spec.whatwg.org/#attr-input-type}
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

/**
 * @public
 */
export function inputType(element: Element<"input">): InputType {
  return element
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
    .getOr("text");
}

/**
 * @public
 */
export function hasInputType(
  predicate: Predicate<InputType>
): Predicate<Element>;

/**
 * @public
 */
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

  return and(hasName("input"), (element) =>
    test(predicate, inputType(element))
  );
}
