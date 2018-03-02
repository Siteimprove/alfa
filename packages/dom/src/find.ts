import { Parent, Element } from "./types";
import { isElement } from "./guards";
import { collect } from "./collect";
import { matches } from "./matches";

export function find(context: Parent, selector: string): Element | null {
  for (const element of findAll(context, selector)) {
    return element;
  }
  return null;
}

export function findAll(context: Parent, selector: string): Iterable<Element> {
  return collect(context)
    .where(isElement)
    .where(element => matches(element, selector));
}
