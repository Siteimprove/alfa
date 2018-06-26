import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  traverseNode,
  getAttribute,
  isElement
} from "@siteimprove/alfa-dom";

import { EN } from "./locale/en";

export const UniqueId: Rule<"document", Element> = {
  id: "alfa:wcag:unique-id",
  locales: [EN],
  definition: (applicability, expectations, { document }) => {
    const ids: Map<string, Set<Element>> = new Map();

    traverseNode(document, {
      enter(node) {
        if (isElement(node)) {
          const id = getAttribute(node, "id");

          if (id) {
            let set = ids.get(id);

            if (set === undefined) {
              set = new Set();
              ids.set(id, set);
            }

            set.add(node);
          }
        }
      }
    });

    applicability(() => {
      const elements: Array<Element> = [];

      for (const entry of ids) {
        const set = entry[1];

        for (const element of set) {
          elements.push(element);
        }
      }

      return elements;
    });

    expectations((target, expectation) => {
      const id = getAttribute(target, "id")!;

      expectation(1, ids.get(id)!.size === 1);
    });
  }
};
