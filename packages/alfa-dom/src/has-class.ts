import { Element } from "./types";
import { getClassList } from "./get-class-list";

export function hasClass(element: Element, className: string): boolean {
  return getClassList(element).indexOf(className) !== -1;
}
