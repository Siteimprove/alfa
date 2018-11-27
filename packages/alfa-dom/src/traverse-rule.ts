import { isGroupingRule, isImportRule, isKeyframesRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";
import { Rule } from "./types";

const Skip = Symbol("Skip");
type Skip = typeof Skip;

const Exit = Symbol("Exit");
type Exit = typeof Exit;

export type RuleVisitor = (
  rule: Rule,
  parentRule: Rule | null,
  commands: Readonly<{ skip: Skip; exit: Exit }>
) => Skip | Exit | void;

const commands: Readonly<{ skip: Skip; exit: Exit }> = {
  skip: Skip,
  exit: Exit
};

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
    const status = enter(rule, parentRule, commands);

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

  if (exit !== undefined && exit(rule, parentRule, commands) === Exit) {
    return false;
  }

  return true;
}
