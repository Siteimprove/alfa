import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export interface ClassList extends Iterable<string> {
  has(className: string): boolean;
}

const classLists: WeakMap<Element, ClassList> = new WeakMap();

export function getClassList(element: Element): ClassList {
  let classList = classLists.get(element);

  if (classList === undefined) {
    classList = new Set((getAttribute(element, "class") || "").split(/\s+/));
    classLists.set(element, classList);
  }

  return classList;
}
