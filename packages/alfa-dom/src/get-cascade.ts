import { Selector } from "@siteimprove/alfa-css";
import { Document, Element, StyleRule } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { SelectorMap } from "./selector-map";
import { AncestorFilter } from "./ancestor-filter";

/**
 * @internal
 */
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

/**
 * @internal
 */
export function getCascade(context: Document): Cascade | null {
  const cascade: WeakMap<Element, Array<CascadeEntry>> = new WeakMap();
  const selectorMap = new SelectorMap(context.styleSheets);
  const filter = new AncestorFilter();

  traverseNode(context, {
    enter(node, parentNode) {
      if (parentNode !== null && isElement(parentNode)) {
        filter.add(parentNode);
      }

      if (isElement(node)) {
        const rules = selectorMap.getRules(node, context, {
          filter,
          hover: true,
          active: true,
          focus: true,
          pseudo: true
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
}
