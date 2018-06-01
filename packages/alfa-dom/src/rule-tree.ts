import { Selector } from "@siteimprove/alfa-css";
import { StyleRule } from "./types";

/**
 * @internal
 */
export interface RuleEntry {
  readonly selector: Selector;
  readonly rule: StyleRule;
  readonly parent: RuleEntry | null;
  readonly children: Array<RuleEntry>;
}

/**
 * @internal
 */
export class RuleTree {
  private children: Array<RuleEntry> = [];

  public insert(
    rules: Array<Readonly<{ selector: Selector; rule: StyleRule }>>
  ): RuleEntry | null {
    let parent: RuleEntry | null = null;
    let { children } = this;

    for (let i = 0, n = rules.length; i < n; i++) {
      const { selector, rule } = rules[i];

      parent = insert(parent, children, selector, rule);
      children = parent.children;
    }

    return parent;
  }
}

function insert(
  parent: RuleEntry | null,
  children: Array<RuleEntry>,
  selector: Selector,
  rule: StyleRule
): RuleEntry {
  if (parent !== null && parent.rule === rule) {
    return parent;
  }

  for (let i = 0, n = children.length; i < n; i++) {
    const child = children[i];

    if (child.rule === rule) {
      return insert(child, child.children, selector, rule);
    }
  }

  const entry = { selector, rule, parent, children: [] };

  children.push(entry);

  return entry;
}
