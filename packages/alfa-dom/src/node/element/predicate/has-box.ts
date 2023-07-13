import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import { Element } from "../../element";

/**
 * @public
 */
export function hasBox(
  predicate: Predicate<Rectangle> = () => true
): Predicate<Element> {
  return (element) => element.box.some(predicate);
}
