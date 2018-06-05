import { Rule } from "./types";
import { isImportRule, isGroupingRule, isKeyframesRule } from "./guards";
import { traverseStyleSheet } from "./traverse-style-sheet";

const enum Action {
  Enter,
  Exit
}

export type RuleVisitor = (rule: Rule, parentRule: Rule | null) => false | void;

export function traverseRule(
  context: Rule,
  visitors: Readonly<{ enter?: RuleVisitor; exit?: RuleVisitor }>
): void {
  const rules: Array<Rule> = [];
  const actions: Array<Action> = [];

  function push(action: Action, rule: Rule, parentRule?: Rule): void {
    if (parentRule === undefined) {
      rules.push(rule);
    } else {
      rules.push(parentRule, rule);
    }

    actions.push(action);
  }

  let action: Action | undefined;
  let rule: Rule | undefined;
  let parentRule: Rule | undefined;

  for (
    action = Action.Enter, rule = context;
    rule !== undefined;
    action = actions.pop(), rule = rules.pop(), parentRule = rules.pop()
  ) {
    if (action === Action.Enter) {
      if (
        visitors.enter !== undefined &&
        visitors.enter(rule, parentRule || null) === false
      ) {
        break;
      }

      if (isImportRule(rule)) {
        traverseStyleSheet(rule.styleSheet, visitors);
      }

      if (isGroupingRule(rule) || isKeyframesRule(rule)) {
        const { cssRules } = rule;

        if (visitors.exit !== undefined) {
          if (cssRules.length > 0) {
            push(Action.Exit, rule, parentRule);
          } else if (visitors.exit(rule, parentRule || null) === false) {
            break;
          }
        }

        for (let i = cssRules.length - 1; i >= 0; i--) {
          push(Action.Enter, cssRules[i], rule);
        }
      }
    } else {
      // Exit actions will only ever be pushed if an exit visitor is defined. We
      // can therefore safely assert that the exit visitor is defined.
      if (visitors.exit!(rule, parentRule || null) === false) {
        break;
      }
    }
  }
}
