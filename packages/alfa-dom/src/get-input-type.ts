import { getAttribute } from "./get-attribute";
import { Element } from "./types";

export const enum InputType {
  Hidden,
  Text,
  Search,
  Tel,
  Url,
  Email,
  Password,
  Date,
  Month,
  Week,
  Time,
  DatetimeLocal,
  Number,
  Range,
  Color,
  Checkbox,
  Radio,
  File,
  Submit,
  Image,
  Reset,
  Button
}

/**
 * @see https://www.w3.org/TR/html/sec-forms.html#element-attrdef-input-type
 */
export function getInputType(element: Element): InputType | null {
  if (element.localName !== "input") {
    return null;
  }

  // The `type` attribute of is an enumerated attribute and is therefore case-
  // insensitive.
  // https://www.w3.org/TR/html/infrastructure.html#enumerated-attributes
  const type = getAttribute(element, "type", { lowerCase: true });

  switch (type) {
    case "hidden":
      return InputType.Hidden;
    case "text":
    default:
      return InputType.Text;
    case "search":
      return InputType.Search;
    case "tel":
      return InputType.Tel;
    case "url":
      return InputType.Url;
    case "email":
      return InputType.Email;
    case "password":
      return InputType.Password;
    case "date":
      return InputType.Date;
    case "month":
      return InputType.Month;
    case "week":
      return InputType.Week;
    case "time":
      return InputType.Time;
    case "datetime-local":
      return InputType.DatetimeLocal;
    case "number":
      return InputType.Number;
    case "range":
      return InputType.Range;
    case "color":
      return InputType.Color;
    case "checkbox":
      return InputType.Checkbox;
    case "radio":
      return InputType.Radio;
    case "file":
      return InputType.File;
    case "submit":
      return InputType.Submit;
    case "image":
      return InputType.Image;
    case "reset":
      return InputType.Reset;
    case "button":
      return InputType.Button;
  }
}
