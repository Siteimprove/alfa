import { Selector } from "@siteimprove/alfa-css";
import { Node, Document, Element, StyleSheet, StyleRule } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { SelectorMap } from "./selector-map";
import { AncestorFilter } from "./ancestor-filter";
import { ObjectCache } from "./object-cache";

export type CascadeEntry = Readonly<{
  selector: Selector;
  rule: StyleRule;
}>;

/**
 * @internal
 */
export interface Cascade {
  get(element: Element): Array<CascadeEntry> | undefined;
}

const cascades: ObjectCache<Document, Cascade> = new ObjectCache();

/**
 * @internal
 */
export function getCascade(document: Document): Cascade {
  return cascades.get(document, () => {
    const cascade: WeakMap<Element, Array<CascadeEntry>> = new WeakMap();
    const selectorMap = new SelectorMap(document.styleSheets);
    const filter = new AncestorFilter();

    traverseNode(document, {
      enter(node, parent) {
        if (parent !== null && isElement(parent)) {
          filter.add(parent);
        }

        if (isElement(node)) {
          const rules = selectorMap.getRules(node, document, {
            filter,
            hover: true,
            active: true,
            focus: true,
            pseudo: true
          });

          rules.sort((a, b) => {
            // If the specificities of the rules are equal, the declaration
            // order will determine the cascade. The rule with the highest
            // order gets the highest priority.
            if (a.specificity === b.specificity) {
              return b.order - a.order;
            }

            // Otherwise, the specificity will determine the cascade. The rule
            // with the highest specificity gets the highest priority.
            return b.specificity - a.specificity;
          });

          cascade.set(node, rules);
        }
      },
      exit(node) {
        if (isElement(node)) {
          filter.remove(node);
        }
      }
    });

    return cascade;
  });
}
