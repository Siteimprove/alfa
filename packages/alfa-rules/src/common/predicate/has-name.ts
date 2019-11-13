import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { test } = Predicate;

export function hasName(
  predicate: Predicate<string> = () => true
): Predicate<Element> {
  return element => test(predicate, element.localName);
}
