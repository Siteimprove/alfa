import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { AncestorFilter } from "./ancestor-filter";
import { isElement } from "./guards";
import { RuleEntry, RuleTree } from "./rule-tree";
import { SelectorEntry, SelectorMap } from "./selector-map";
import { traverseNode } from "./traverse-node";
import { Document, Element, ShadowRoot } from "./types";
import { UserAgent } from "./user-agent";

/**
 * @internal
 */
export class Cascade {
  public static of(entries: WeakMap<Element, RuleEntry>): Cascade {
    return new Cascade(entries);
  }

  private readonly entries: WeakMap<Element, RuleEntry>;

  private constructor(entries: WeakMap<Element, RuleEntry>) {
    this.entries = entries;
  }

  public get(element: Element): Option<RuleEntry> {
    return Option.from(this.entries.get(element));
  }
}

/**
 * @internal
 */
export namespace Cascade {
  export function from(iterable: Iterable<[Element, RuleEntry]>): Cascade {
    return Cascade.of(
      Iterable.reduce(
        iterable,
        (entries, [element, entry]) => entries.set(element, entry),
        new WeakMap()
      )
    );
  }
}

const cascades = Cache.empty<Document | ShadowRoot, Cache<Device, Cascade>>();

/**
 * @internal
 */
export function getCascade(
  context: Document | ShadowRoot,
  device: Device
): Cascade {
  return cascades.get(context, Cache.empty).get(device, () => {
    const filter = new AncestorFilter();
    const ruleTree = new RuleTree();

    const selectorMap = new SelectorMap(
      [UserAgent].concat(Array.from(context.styleSheets)),
      device
    );

    return Cascade.from(
      traverseNode(context, context, {
        *enter(node) {
          if (isElement(node)) {
            const rules = selectorMap.getRules(node, context, {
              filter,
              hover: true,
              active: true,
              focus: true,
              pseudo: true
            });

            const entry = ruleTree.add(sort(rules));

            if (entry !== null) {
              yield [node, entry];
            }

            filter.add(node, context);
          }
        },
        *exit(node) {
          if (isElement(node)) {
            filter.remove(node, context);
          }
        }
      })
    );
  });
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
function sort(selectors: Array<SelectorEntry>): Array<SelectorEntry> {
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
