import { Node, Document, Element, StyleSheet, StyleRule } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { SelectorMap } from "./selector-map";
import { AncestorFilter } from "./ancestor-filter";
import { ObjectCache } from "./object-cache";

/**
 * @internal
 */
export interface Cascade {
  get(element: Element): Array<StyleRule> | undefined;
}

const cascades: ObjectCache<Document, Cascade> = new ObjectCache();

/**
 * @internal
 */
export function getCascade(document: Document): Cascade {
  return cascades.get(document, () => {
    const cascade: WeakMap<Element, Array<StyleRule>> = new WeakMap();
    const selectorMap = new SelectorMap(document.styleSheets);
    const ancestorFilter = new AncestorFilter();

    traverseNode(document, {
      enter(node, parent) {
        if (parent !== null && isElement(parent)) {
          ancestorFilter.add(parent);
        }

        if (isElement(node)) {
          const rules = selectorMap.getRules(node, document, {
            filter: ancestorFilter
          });

          rules.sort((a, b) => {
            // If the specificities of the rules are equal, the declaration order
            // will determine the cascade. The rule with the highest order gets
            // the highest priority.
            if (a.specificity === b.specificity) {
              return b.order - a.order;
            }

            // Otherwise, the specificity will determine the cascade. The rule
            // with the highest specificity gets the highest priority.
            return b.specificity - a.specificity;
          });

          cascade.set(node, rules.map(({ rule }) => rule));
        }
      },
      exit(node) {
        if (isElement(node)) {
          ancestorFilter.remove(node);
        }
      }
    });

    return cascade;
  });
}
