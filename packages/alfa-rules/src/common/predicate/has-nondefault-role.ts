import { Role } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export const hasNondefaultRole: Predicate<Element> = element =>
  Role.from(element, { explicit: false })
    .flatMap(implicit =>
      Role.from(element, { implicit: false }).map(
        explicit =>
          explicit.isSome() !== implicit.isSome() ||
          explicit.some(explicit =>
            implicit.some(implicit => explicit !== implicit)
          )
      )
    )
    .some(different => different);
