import { isWhitespace } from "@siteimprove/alfa-util";
import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export function hasClass(element: Element, className: string): boolean {
  const classNames = getAttribute(element, "class");

  if (classNames === null) {
    return false;
  }

  const { length } = classNames;

  let start = 0;

  while (start < length) {
    let end = start;

    while (!isWhitespace(classNames[end]) && end < length) {
      end++;
    }

    if (start !== end && className === classNames.substring(start, end)) {
      return true;
    }

    while (isWhitespace(classNames[end]) && end < length) {
      end++;
    }

    start = end;
  }

  return false;
}
