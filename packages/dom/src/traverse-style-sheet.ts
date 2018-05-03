import { Rule, StyleSheet } from "./types";
import { traverseRule } from "./traverse-rule";

export function traverseStyleSheet(
  context: StyleSheet,
  visitor: (target: Rule, parent: Rule | null) => false | void
): void {
  const { cssRules } = context;

  for (let i = 0, n = cssRules.length; i < n; i++) {
    traverseRule(cssRules[i], visitor);
  }
}
