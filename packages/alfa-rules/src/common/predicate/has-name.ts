import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasName(name: string): Predicate<Element> {
  return element => name === element.localName;
}
