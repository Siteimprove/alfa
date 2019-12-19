import { Declaration, Rule } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Selector } from "@siteimprove/alfa-selector";

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
 * @internal
 */
export class RuleTree {
  private readonly children: Array<RuleTree.Node> = [];

  public add(
    rules: Iterable<Pick<RuleTree.Node, "rule" | "selector" | "declarations">>
  ): Option<RuleTree.Node> {
    let parent: Option<RuleTree.Node> = None;
    let children = this.children;

    for (const { rule, selector, declarations } of rules) {
      // Insert the next rule into the current parent, using the returned rule
      // entry as the parent of the next rule to insert. This way, we gradually
      // build up a path of rule entries and then return the final entry to the
      // caller.
      parent = Option.of(add(rule, selector, declarations, parent, children));
      children = parent.get().children;
    }

    return parent;
  }
}

/**
 * @internal
 */
export namespace RuleTree {
  export class Node {
    public static of(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      children: Array<Node>,
      parent: Option<Node>
    ): Node {
      return new Node(rule, selector, declarations, children, parent);
    }

    public readonly rule: Rule;
    public readonly selector: Selector;
    public readonly declarations: Iterable<Declaration>;
    public readonly parent: Option<Node>;
    public readonly children: Array<Node>;

    private constructor(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      children: Array<Node>,
      parent: Option<Node>
    ) {
      this.rule = rule;
      this.selector = selector;
      this.declarations = declarations;
      this.children = children;
      this.parent = parent;
    }
  }
}

function add(
  rule: Rule,
  selector: Selector,
  declarations: Iterable<Declaration>,
  parent: Option<RuleTree.Node>,
  children: Array<RuleTree.Node>
): RuleTree.Node {
  if (parent.isSome() && parent.get().selector === selector) {
    return parent.get();
  }

  for (const child of children) {
    if (child.selector.equals(selector)) {
      return add(
        rule,
        selector,
        declarations,
        Option.of(child),
        child.children
      );
    }
  }

  const node = RuleTree.Node.of(rule, selector, declarations, [], parent);

  children.push(node);

  return node;
}
