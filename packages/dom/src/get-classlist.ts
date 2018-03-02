import { Element } from "./types";
import { getAttribute } from "./get-attribute";

const whitespace = /\s+/;

export function getClasslist(element: Element): Set<string> {
  const classes = getAttribute(element, "class");
  return new Set(classes === undefined ? [] : classes.split(whitespace));
}
