import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export interface ClassList extends Iterable<string> {
  has(className: string): boolean;
}

const whitespace = /\s+/;

export function getClassList(element: Element): ClassList {
  const classes = getAttribute(element, "class");
  return new Set(classes === null ? [] : classes.split(whitespace));
}
