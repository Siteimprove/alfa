import { traverseRule, visitRule } from "./traverse-rule";
import { StyleSheet } from "./types";

/**
 * Given a style sheet, perform a depth-first traversal of the rules of the
 * style sheet, invoking the given visitors for all of its children.
 *
 * @see https://dom.spec.whatwg.org/#concept-tree-order
 */
export function traverseStyleSheet<T>(
  styleSheet: StyleSheet,
  visitors: traverseRule.Visitors<T>
): Iterable<T> {
  return visitStyleSheet(styleSheet, visitors);
}

/**
 * @internal
 */
export function* visitStyleSheet<T>(
  styleSheet: StyleSheet,
  visitors: traverseRule.Visitors<T>
): Generator<T, void> {
  const { cssRules } = styleSheet;

  if (cssRules !== undefined) {
    for (let i = 0, n = cssRules.length; i < n; i++) {
      yield* visitRule(cssRules[i], null, visitors);
    }
  }
}
