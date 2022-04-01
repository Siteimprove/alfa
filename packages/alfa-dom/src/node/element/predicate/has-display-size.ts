import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element";

/**
 * @public
 */
export function hasDisplaySize(
  valueOrPredicate: number | Predicate<number>
): Predicate<Element> {
  const predicate =
    typeof valueOrPredicate === "function"
      ? valueOrPredicate
      : (size: number) => valueOrPredicate === size;

  return (element) => {
    const displaySize = element
      .attribute("size")
      .flatMap((size) => {
        const sizeValue = parseInt(size.value, 10);
        if (sizeValue === sizeValue && sizeValue === (sizeValue | 0)) {
          return Option.of(sizeValue);
        } else {
          return None;
        }
      })
      .getOrElse(() =>
        element
          .attribute("multiple")
          .map(() => 4)
          .getOr(1)
      );

    return predicate(displaySize);
  };
}
