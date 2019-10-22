import { isGroupingRule, isImportRule, isKeyframesRule } from "./guards";
import { visitStyleSheet } from "./traverse-style-sheet";
import { Rule } from "./types";

/**
 * Given a rule, perform a depth-first traversal of the rule, invoking the
 * given visitors for the context itself and all of its children.
 *
 * @see https://dom.spec.whatwg.org/#concept-tree-order
 */
export function traverseRule<T>(
  rule: Rule,
  visitors: traverseRule.Visitors<T>
): Iterable<T> {
  return visitRule(rule, null, visitors);
}

export namespace traverseRule {
  /**
   * A visitor is a generator function invoked when visiting a rule. A visitor
   * may yield values which are then also yielded by the `traverseRule()`
   * function. Certain visitors also allow returning values, which can signal
   * different things depending on the visitor.
   */
  export type Visitor<T, R = void, N = unknown> = (
    rule: Rule,
    parentRule: Rule | null
  ) => Generator<T, R | void, N>;

  export interface Visitors<T> {
    /**
     * This visitor is invoked when a rule is first encountered. If the `enter`
     * visitor returns `false`, the subtree rooted at the current rule is not
     * visited.
     */
    readonly enter?: Visitor<T, boolean>;

    /**
     * This visitor is invoked when a rule is left. This happens when the
     * subtree rooted at the current rule has also been visited. If the current
     * rule has no subtree, or the subtree has been skipped, the `exit` visitor
     * is invoked immediately after the `enter` visitor.
     */
    readonly exit?: Visitor<T>;
  }
}

/**
 * @internal
 */
export function* visitRule<T>(
  rule: Rule,
  parentRule: Rule | null,
  visitors: traverseRule.Visitors<T>
): Generator<T, void> {
  const { enter, exit } = visitors;

  if (enter !== undefined) {
    const subtree = yield* enter(rule, parentRule);

    if (subtree === false) {
      if (exit !== undefined) {
        yield* exit(rule, parentRule);
      }

      return;
    }
  }

  if (isImportRule(rule)) {
    yield* visitStyleSheet(rule.styleSheet, visitors);
  }

  if (isGroupingRule(rule) || isKeyframesRule(rule)) {
    const { cssRules } = rule;

    for (let i = 0, n = cssRules.length; i < n; i++) {
      yield* visitRule(cssRules[i], rule, visitors);
    }
  }

  if (exit !== undefined) {
    yield* exit(rule, parentRule);
  }
}
