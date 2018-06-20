import { concat } from "@siteimprove/alfa-util";
import { Document, Element } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { SelectorMap, SelectorEntry } from "./selector-map";
import { AncestorFilter } from "./ancestor-filter";
import { RuleTree, RuleEntry } from "./rule-tree";
import { UserAgent } from "./user-agent";

/**
 * @internal
 */
export interface Cascade {
  get(element: Element): RuleEntry | undefined;
}

const cascades: WeakMap<Document, Cascade> = new WeakMap();

/**
 * @internal
 */
export function getCascade(context: Document): Cascade | null {
  let cascade = cascades.get(context);

  if (cascade === undefined) {
    const entries: WeakMap<Element, RuleEntry> = new WeakMap();

    const filter = new AncestorFilter();
    const ruleTree = new RuleTree();

    const selectorMap = new SelectorMap(
      concat([UserAgent], context.styleSheets)
    );

    traverseNode(context, {
      enter(node) {
        if (isElement(node)) {
          const rules = selectorMap.getRules(node, context, {
            filter,
            hover: true,
            active: true,
            focus: true,
            pseudo: true
          });

          const entry = ruleTree.insert(sort(rules));

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

    cascade = entries;
    cascades.set(context, cascade);
  }

  return cascade;
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
