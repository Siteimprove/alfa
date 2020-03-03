import { Cache } from "@siteimprove/alfa-cache";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasId } from "./has-id";

const { and } = Predicate;

const uniques = Cache.empty<Node, Set<string>>();

export function hasUniqueId(): Predicate<Element> {
  return and(hasId(), element =>
    uniques
      .get(element.root(), () => {
        const counts = new Map<string, number>();

        for (const node of element.root().descendants()) {
          if (Element.isElement(node) && node.id.isSome()) {
            const id = node.id.get();
            const count = counts.get(id);

            if (count === undefined) {
              counts.set(id, 1);
            } else {
              counts.set(id, 1 + count);
            }
          }
        }

        return new Set(
          Iterable.map(
            Iterable.filter(counts, ([, count]) => count === 1),
            ([id]) => id
          )
        );
      })
      .has(element.id.get())
  );
}
