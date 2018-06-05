import { Document, Element } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { SelectorMap, SelectorEntry } from "./selector-map";
import { AncestorFilter } from "./ancestor-filter";
import { RuleTree, RuleEntry } from "./rule-tree";

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

    const selectorMap = new SelectorMap(context.styleSheets);
    const filter = new AncestorFilter();
    const ruleTree = new RuleTree();

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

          sort(rules);

          const entry = ruleTree.insert(rules);

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

function sort(selectors: Array<SelectorEntry>): void {
  for (let i = 0, n = selectors.length; i < n; i++) {
    const a = selectors[i];

    let j = i - 1;

    while (j >= 0) {
      const b = selectors[j];

      // If the specificities of the rules are equal, the declaration order
      // will determine the cascade. The rule with the highest order gets the
      // highest priority.
      if (a.specificity === b.specificity && a.order > b.order) {
        break;
      }

      // Otherwise, the specificity will determine the cascade. The rule with
      // the highest specificity gets the highest priority.
      if (a.specificity > b.specificity) {
        break;
      }

      selectors[j + 1] = selectors[j--];
    }

    selectors[j + 1] = a;
  }
}
