import { Selector, Declaration } from "@siteimprove/alfa-css";

/**
 * @internal
 */
export interface RuleEntry {
  readonly selector: Selector;
  readonly declarations: Array<Declaration>;
  readonly parent: RuleEntry | null;
  readonly children: Array<RuleEntry>;
}

/**
 * @internal
 */
export class RuleTree {
  private children: Array<RuleEntry> = [];

  public insert(
    rules: Array<Pick<RuleEntry, "selector" | "declarations">>
  ): RuleEntry | null {
    let parent: RuleEntry | null = null;
    let { children } = this;

    for (let i = 0, n = rules.length; i < n; i++) {
      const { selector, declarations } = rules[i];

      parent = insert(parent, children, selector, declarations);
      children = parent.children;
    }

    return parent;
  }
}

function insert(
  parent: RuleEntry | null,
  children: Array<RuleEntry>,
  selector: Selector,
  declarations: Array<Declaration>
): RuleEntry {
  if (parent !== null && parent.selector === selector) {
    return parent;
  }

  for (let i = 0, n = children.length; i < n; i++) {
    const child = children[i];

    if (child.selector === selector) {
      return insert(child, child.children, selector, declarations);
    }
  }

  const entry = { selector, declarations, parent, children: [] };

  children.push(entry);

  return entry;
}
