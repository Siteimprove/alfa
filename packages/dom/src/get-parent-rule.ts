import { Rule, StyleSheet } from "./types";
import { traverseRule } from "./traverse-rule";
import { traverseStyleSheet } from "./traverse-style-sheet";

const parentMaps: WeakMap<
  Rule | StyleSheet,
  WeakMap<Rule, Rule>
> = new WeakMap();

/**
 * Given a rule and a context, get the parent of the rule within the context.
 *
 * @see https://www.w3.org/TR/cssom/#dom-cssrule-parentrule
 */
export function getParentRule(
  rule: Rule,
  context: Rule | StyleSheet
): Rule | null {
  let parentMap = parentMaps.get(context);

  if (parentMap === undefined) {
    parentMap = new WeakMap();

    if ("disabled" in context) {
      traverseStyleSheet(context, (rule, parent) => {
        if (parent !== null && parentMap !== undefined) {
          parentMap.set(rule, parent);
        }
      });
    } else {
      traverseRule(context, (rule, parent) => {
        if (parent !== null && parentMap !== undefined) {
          parentMap.set(rule, parent);
        }
      });
    }

    parentMaps.set(context, parentMap);
  }

  return parentMap.get(rule) || null;
}
