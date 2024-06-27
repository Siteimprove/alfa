import { Cache } from "@siteimprove/alfa-cache";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Element } from "../../element.js";
import { Node } from "../../../node.js";

import { hasId } from "./has-id.js";

const { and } = Predicate;

const uniques = Cache.empty<Node, Set<string>>();

/**
 * @public
 */
export const hasUniqueId: Predicate<Element> = and(hasId(), (element) =>
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
          ([id]) => id,
        ),
      );
    })
    // The initial hasId in the conjunction guarantee that there is one.
    // Still defaulting to an impossible one.
    .has(element.id.getOr("impossible id due to spaces")),
);
