import { Element } from "../element";

/**
 * {@link https://html.spec.whatwg.org/#attr-input-type}
 *
 * @internal
 */
export type InputType =
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
