import { isGroupingRule, isImportRule, isKeyframesRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Rule } from "./types";

export type RuleVisitor = (rule: Rule, parentRule: Rule | null) => false | void;

export function traverseRule(
  context: Rule,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  return visitRule(context, null, visitors);
}

function visitRule(
  rule: Rule,
  parentRule: Rule | null,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  const { enter, exit } = visitors;

  if (enter !== undefined && enter(rule, parentRule) === false) {
    return false;
  }

  if (isImportRule(rule)) {
    traverseStyleSheet(rule.styleSheet, visitors);
  }

  if (isGroupingRule(rule) || isKeyframesRule(rule)) {
    const { cssRules } = rule;

    for (let i = 0, n = cssRules.length; i < n; i++) {
      if (visitRule(cssRules[i], rule, visitors) === false) {
        return false;
      }
    }
  }

  if (exit !== undefined && exit(rule, parentRule) === false) {
    return false;
  }

  return true;
}
