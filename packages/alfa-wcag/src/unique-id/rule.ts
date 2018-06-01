import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  traverseNode,
  getAttribute,
  isElement
} from "@siteimprove/alfa-dom";

import { EN } from "./locale/en";

export type Context = Map<string, Set<Element>>;

export const UniqueId: Rule<"document", Element, Context> = {
  id: "alfa:wcag:unique-id",
  criteria: ["wcag:4.1.1"],
  locales: [EN],
  context: ({ document }) => {
    const context: Context = new Map();

    traverseNode(document, {
      enter(node) {
        if (isElement(node)) {
          const id = getAttribute(node, "id");

          if (id) {
            let set = context.get(id);

            if (set === undefined) {
              set = new Set();
              context.set(id, set);
            }

            set.add(node);
          }
        }
      }
    });

    return context;
  },
  applicability: (aspects, context) => {
    const elements: Array<Element> = [];

    for (const entry of context) {
      const set = entry[1];

      for (const element of set) {
        elements.push(element);
      }
    }

    return elements;
  },
  expectations: {
    1: (target, aspects, question, context) => {
      const id = getAttribute(target, "id");

      if (id === null) {
        return true;
      }

      return context.get(id)!.size === 1;
    }
  }
};
