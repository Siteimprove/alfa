import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasId(
  predicate: Predicate<string> = () => true
): Predicate<Element> {
  return (element) => element.id.filter(predicate).isSome();
}
