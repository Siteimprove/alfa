import { Cache } from "@siteimprove/alfa-cache";
import { Option } from "@siteimprove/alfa-option";

import { isDocument } from "./guards";
import { traverseNode } from "./traverse-node";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Node, Rule } from "./types";

const parentRules = Cache.empty<Node, Cache<Rule, Rule>>();

/**
 * Given a rule and a context, get the parent of the rule within the context.
 * If the rule has no parent within the context, `null` is returned.
 *
 * @see https://www.w3.org/TR/cssom/#dom-cssrule-parentrule
 */
export function getParentRule(rule: Rule, context: Node): Option<Rule> {
  return parentRules
    .get(context, () =>
      Cache.from<Rule, Rule>(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              if (isDocument(node)) {
                const { styleSheets } = node;

                for (let i = 0, n = styleSheets.length; i < n; i++) {
                  yield* traverseStyleSheet(styleSheets[i], {
                    *enter(rule, parentRule) {
                      if (parentRule !== null) {
                        yield [rule, parentRule];
                      }
                    }
                  });
                }
              }
            }
          },
          { composed: true, nested: true }
        )
      )
    )
    .get(rule);
}
