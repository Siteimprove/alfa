import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Cell } from "../../cell";

const { equals } = Predicate;

export function hasElement(predicate: Predicate<Element>): Predicate<Cell>;

export function hasElement(element: Element): Predicate<Cell>;

export function hasElement(
  elementOrPredicate: Element | Predicate<Element>
): Predicate<Cell> {
  let predicate: Predicate<Element>;

  if (typeof elementOrPredicate === "function") {
    predicate = elementOrPredicate;
  } else {
    predicate = equals(elementOrPredicate);
  }

  return (cell) => predicate(cell.element);
}
