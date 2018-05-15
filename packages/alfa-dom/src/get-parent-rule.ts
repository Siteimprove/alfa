import { Rule, StyleSheet } from "./types";
import { traverseRule } from "./traverse-rule";
import { traverseStyleSheet } from "./traverse-style-sheet";

const { isArray } = Array;

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
  context: Rule | StyleSheet | ArrayLike<StyleSheet>
): Rule | null {
  const contexts = isArray(context) ? context : [context];

  for (const context of contexts) {
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

    if (parentMap.has(rule)) {
      return parentMap.get(rule)!;
    }
  }

  return null;
}
