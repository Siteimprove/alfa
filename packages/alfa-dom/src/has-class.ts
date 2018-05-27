import { isWhitespace } from "@siteimprove/alfa-util";
import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export function hasClass(element: Element, className: string): boolean {
  const classNames = getAttribute(element, "class");

  if (classNames === null) {
    return false;
  }

  const index = classNames.indexOf(className);

  if (index === -1) {
    return false;
  }

  const before = classNames[index - 1];
  const after = classNames[index + className.length];

  return (
    (before === undefined || isWhitespace(before)) &&
    (after === undefined || isWhitespace(after))
  );
}
