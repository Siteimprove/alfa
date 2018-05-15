import { Rule } from "./types";
import { isImportRule, isGroupingRule, isKeyframesRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";

export function traverseRule(
  context: Rule,
  visitor: (target: Rule, parent: Rule | null) => false | void
): void {
  const queue: Array<Rule> = [];

  for (
    let child: Rule | undefined = context, parent: Rule | undefined;
    child;
    child = queue.pop(), parent = queue.pop()
  ) {
    if (visitor(child, parent || null) === false) {
      break;
    }

    if (isImportRule(child)) {
      traverseStyleSheet(child.styleSheet, visitor);
    }

    if (isGroupingRule(child) || isKeyframesRule(child)) {
      const { cssRules } = child;

      for (let i = cssRules.length - 1; i >= 0; i--) {
        queue.push(child, cssRules[i]);
      }
    }
  }
}
