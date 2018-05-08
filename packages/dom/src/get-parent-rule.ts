import { Rule, StyleSheet } from "./types";
import { traverseRule } from "./traverse-rule";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { ParentTree } from "./parent-tree";

const parentTrees: WeakMap<Rule | StyleSheet, ParentTree<Rule>> = new WeakMap();

/**
 * Given a rule and a context, get the parent of the rule within the context.
 *
 * @see https://www.w3.org/TR/cssom/#dom-cssrule-parentrule
 */
export function getParentRule(
  rule: Rule,
  context: Rule | StyleSheet
): Rule | null {
  let parentTree = parentTrees.get(context);

  if (parentTree === undefined) {
    parentTree = new ParentTree();

    if ("disabled" in context) {
      traverseStyleSheet(context, (rule, parent) => {
        if (parent !== null && parentTree !== undefined) {
          parentTree.join(rule, parent);
        }
      });
    } else {
      traverseRule(context, (rule, parent) => {
        if (parent !== null && parentTree !== undefined) {
          parentTree.join(rule, parent);
        }
      });
    }

    parentTrees.set(context, parentTree);
  }

  return parentTree.get(rule);
}
