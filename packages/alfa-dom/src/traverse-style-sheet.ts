import { StyleSheet } from "./types";
import { RuleVisitor, traverseRule } from "./traverse-rule";

export function traverseStyleSheet(
  context: StyleSheet,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): void {
  const { cssRules } = context;

  for (let i = 0, n = cssRules.length; i < n; i++) {
    traverseRule(cssRules[i], visitors);
  }
}
