import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";

import { AncestorFilter } from "./cascade/ancestor-filter";
import { RuleTree } from "./cascade/rule-tree";
import { SelectorMap } from "./cascade/selector-map";
import { UserAgent } from "./cascade/user-agent";

/**
 * @internal
 */
export class Cascade {
  public static of(entries: WeakMap<Element, RuleTree.Node>): Cascade {
    return new Cascade(entries);
  }

  private readonly entries: WeakMap<Element, RuleTree.Node>;

  private constructor(entries: WeakMap<Element, RuleTree.Node>) {
    this.entries = entries;
  }

  public get(element: Element): Option<RuleTree.Node> {
    return Option.from(this.entries.get(element));
  }
}

/**
 * @internal
 */
export namespace Cascade {
  export function from(node: Document | Shadow, device: Device): Cascade {
    const filter = new AncestorFilter();
    const ruleTree = new RuleTree();

    const selectorMap = new SelectorMap(
      [UserAgent].concat(Array.from(node.style)),
      device
    );

    return Cascade.of(
      Iterable.reduce(
        visit(node),
        (entries, [element, entry]) => entries.set(element, entry),
        new WeakMap()
      )
    );

    function* visit(node: Node): Iterable<[Element, RuleTree.Node]> {
      if (Element.isElement(node)) {
        const rules = selectorMap.get(node);

        const entry = ruleTree.add(sort(rules));

        if (entry.isSome()) {
          yield [node, entry.get()];
        }

        filter.add(node);

        for (const child of node.children()) {
          yield* visit(child);
        }

        filter.remove(node);
      }
    }
  }
}

/**
 * Perform an in-place insertion sort of an array of selector entries. Since
 * insertion sort performs well on small arrays compared to other sorting
 * algorithms, it's a good choice for sorting selector entries during cascade
 * as the number of declarations that match an element will more often than not
 * be relatively small.
 *
 * @see https://en.wikipedia.org/wiki/Insertion_sort
 */
function sort(selectors: Array<SelectorMap.Node>): Array<SelectorMap.Node> {
  for (let i = 0, n = selectors.length; i < n; i++) {
    const a = selectors[i];

    let j = i - 1;

    while (j >= 0) {
      const b = selectors[j];

      // If the origins of the rules are not equal, the origin of the rules
      // will determine the cascade.
      if (a.origin !== b.origin && a.origin > b.origin) {
        break;
      }

      // If the specificities of the rules are equal, the declaration order
      // will determine the cascade.
      if (a.specificity === b.specificity && a.order > b.order) {
        break;
      }

      // Otherwise, the specificity will determine the cascade.
      if (a.specificity > b.specificity) {
        break;
      }

      selectors[j + 1] = selectors[j--];
    }

    selectors[j + 1] = a;
  }

  return selectors;
}
