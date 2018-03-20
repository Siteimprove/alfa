import { Element } from "./types";

export function getTag(element: Element): string {
  return element.tagName.toLowerCase();
}
