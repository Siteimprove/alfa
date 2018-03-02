import { Parent, Element } from "./types";
import { isElement } from "./guards";
import { Collector, collect } from "./collect";
import { matches } from "./matches";

function query(context: Parent, selector: string): Collector<Element> {
  return collect(context)
    .where(isElement)
    .where(element => matches(element, selector));
}

export function find(context: Parent, selector: string): Element | null {
  return query(context, selector).first();
}

export function findAll(context: Parent, selector: string): Iterable<Element> {
  return query(context, selector);
}
