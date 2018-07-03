import { Declaration, Selector } from "@siteimprove/alfa-css";

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
 * The rule tree is a data structure used for storing the rules that match each
 * element when computing cascade for a document. Rules are stored in order
 * from most to least specific; rules lower in the tree are therefore more
 * specific than rules higher in the tree. Each element gets a pointer to the
 * most specific rule it matched and can then follow pointers up the rule tree
 * to locate decreasingly specific rules that the element also matches. This
 * allows elements that share matched rules to also share a path in the rule
 * tree.
 *
 * As an example, consider elements A and B. Element A matches rules `div`,
 * `.foo` and `.foo[href]` whereas element B matches rules `div`, `.foo` and
 * `.bar`. The naïve approach to associating these matched rules with elements
 * would be to associate an array of `[".foo[href]", ".foo", "div"]` with
 * element A and an array of `[".foo", "div"]` with element B. With the rule
 * tree, we instead start by inserting the matched rules for element A into the
 * tree:
 *
 *  "div"
 *  +-- ".foo"
 *      +-- ".foo[href]"
 *
 * We then associate rule `".foo[href]"` with element A and go ahead and insert
 * the matched rules for element B into the tree:
 *
 *  "div"
 *  +-- ".foo"
 *      +-- ".foo[href]"
 *      +-- ".bar"
 *
 * We then associate the rule `".bar"` with element B and we're done. Notice how
 * the tree branches at rule `".foo"`, allowing the two elements to share the
 * path in the rule tree that they have in common. This approach is conceptually
 * similar to associating arrays of matched rules with elements with the
 * difference being that we use linked lists instead of arrays, allowing us to
 * share parts of the list between elements. This allows for a much more memory
 * efficient way of associating matched rules with elements, in particular for
 * rules that match most elements, such as the universal selector or `html` and
 * `body`.
 *
 * @see http://doc.servo.org/style/rule_tree/struct.RuleTree.html
 *
 * @internal
 */
export class RuleTree {
  private readonly children: Array<RuleEntry> = [];

  public add(
    rules: Array<Pick<RuleEntry, "selector" | "declarations">>
  ): RuleEntry | null {
    let parent: RuleEntry | null = null;
    let children = this.children;

    for (let i = 0, n = rules.length; i < n; i++) {
      const { selector, declarations } = rules[i];

      // Insert the next rule into the current parent, using the returned rule
      // entry as the parent of the next rule to insert. This way, we gradually
      // build up a path of rule entries and then return the final entry to the
      // caller.
      parent = add(parent, children, selector, declarations);
      children = parent.children;
    }

    return parent;
  }
}

function add(
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
      return add(child, child.children, selector, declarations);
    }
  }

  const entry = { selector, declarations, parent, children: [] };

  children.push(entry);

  return entry;
}
