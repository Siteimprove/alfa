import { Device } from "@siteimprove/alfa-device";
import { Cache } from "@siteimprove/alfa-util";
import { AncestorFilter } from "./ancestor-filter";
import { isElement } from "./guards";
import { RuleEntry, RuleTree } from "./rule-tree";
import { SelectorEntry, SelectorMap } from "./selector-map";
import { traverseNode } from "./traverse-node";
import { Document, Element } from "./types";
import { UserAgent } from "./user-agent";

/**
 * @internal
 */
export class Cascade {
  private readonly entries: WeakMap<Element, RuleEntry>;

  public constructor(entries: WeakMap<Element, RuleEntry>) {
    this.entries = entries;
  }

  public get(element: Element): RuleEntry | null {
    const entry = this.entries.get(element);

    if (entry === undefined) {
      return null;
    }

    return entry;
  }
}

const cascades = Cache.of<Document, Cache<Device, Cascade>>();

/**
 * @internal
 */
export function getCascade(context: Document, device: Device): Cascade {
  return cascades.get(context, Cache.of).get(device, () => {
    const entries: WeakMap<Element, RuleEntry> = new WeakMap();

    const filter = new AncestorFilter();
    const ruleTree = new RuleTree();

    const selectorMap = new SelectorMap(
      [UserAgent].concat(Array.from(context.styleSheets)),
      device
    );

    traverseNode(context, context, {
      enter(node) {
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
            entries.set(node, entry);
          }

          filter.add(node);
        }
      },
      exit(node) {
        if (isElement(node)) {
          filter.remove(node);
        }
      }
    });

    return new Cascade(entries);
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
