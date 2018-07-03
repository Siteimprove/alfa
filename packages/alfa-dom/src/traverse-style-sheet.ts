import { RuleVisitor, traverseRule } from "./traverse-rule";
import { StyleSheet } from "./types";

export function traverseStyleSheet(
  context: StyleSheet,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  const { cssRules } = context;

  for (let i = 0, n = cssRules.length; i < n; i++) {
    if (!traverseRule(cssRules[i], visitors)) {
      return false;
    }
  }

  return true;
}
