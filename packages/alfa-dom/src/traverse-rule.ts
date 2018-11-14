import { isGroupingRule, isImportRule, isKeyframesRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Rule } from "./types";

const Skip = Symbol("Skip");
const Exit = Symbol("Exit");

export type RuleVisitor = (rule: Rule, parentRule: Rule | null, skip: symbol, exit: symbol) => symbol | void;

/**
 * Given a rule, perform a depth-first traversal of the rule, invoking the
 * given visitors for the context itself and all of its children.
 *
 * @see https://www.w3.org/TR/dom/#concept-tree-order
 */
export function traverseRule(
  rule: Rule,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  return visitRule(rule, null, visitors);
}

function visitRule(
  rule: Rule,
  parentRule: Rule | null,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): boolean {
  const { enter, exit } = visitors;

  if (enter !== undefined) {
    const status = enter(rule, parentRule, Skip, Exit);

    if (status === Exit) {
      return false;
    }

    if (status === Skip) {
      return true;
    }
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

  if (exit !== undefined && exit(rule, parentRule, Skip, Exit) === Exit) {
    return false;
  }

  return true;
}
