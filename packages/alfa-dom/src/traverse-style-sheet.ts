import { RuleVisitor, traverseRule } from "./traverse-rule";
import { StyleSheet } from "./types";

/**
 * Given a style sheet, perform a preorder, depth-first traversal of the rules
 * of the style sheet, invoking the visitors for all of its children. A visitor
 * may return `false` in order to stop the traversal, resulting in the function
 * itself returning `false`. If traversal finishes without interruption, `true`
 * is returned.
 *
 * @see https://www.w3.org/TR/dom/#concept-tree-order
 */
export function traverseStyleSheet(
  styleSheet: StyleSheet,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  const { cssRules } = styleSheet;

  for (let i = 0, n = cssRules.length; i < n; i++) {
    if (!traverseRule(cssRules[i], visitors)) {
      return false;
    }
  }

  return true;
}
