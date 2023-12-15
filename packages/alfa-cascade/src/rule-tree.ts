import { Declaration, h, Rule } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Selector, Specificity, Universal } from "@siteimprove/alfa-selector";

import { Block } from "./block";
import { Origin } from "./precedence";

/**
 * The rule tree is a data structure used for storing the rules that match each
 * element when computing cascade for a document.
 *
 * @remarks
 * Rules are stored in order from most to least precedence (according to cascade
 * sorting order); rules lower in the tree have therefore higher precedence than
 * rules higher in the tree. Each element gets a pointer to the highest
 * precedence rule it matched and can then follow pointers up the rule tree to
 * locate rules of decreasing precedence that the element also matches. This
 * allows elements that share matched rules to also share a path in the rule tree.
 *
 * As an example, consider elements `A = <div class="foo" href="A">`  and
 * `B = <div class="foo bar">`. Element A matches rules `div`, `.foo` and
 * `.foo[href]` whereas element B matches rules `div`, `.foo` and `.bar`. The
 * naïve approach to associating these matched rules with elements
 * would be to associate an array of `[".foo[href]", ".foo", "div"]` with
 * element A and an array of `[".bar", ".foo", "div"]` with element B. With the
 * rule tree, we instead start by inserting the matched rules for element A into
 * the tree:
 *
 *  "div"
 *  +-- ".foo"
 *      +-- ".foo[href]"     (A)
 *
 * We then associate rule `".foo[href]"` with element A and insert the matched
 * rules for element B into the tree:
 *
 *  "div"
 *  +-- ".foo"
 *      +-- ".foo[href]"    (A)
 *      +-- ".bar"          (B)
 *
 * We then associate the rule `".bar"` with element B, and we're done. Notice how
 * the tree branches at rule `".foo"`, allowing the two elements to share the
 * path in the rule tree that they have in common. This approach is conceptually
 * similar to associating arrays of matched rules with elements with the
 * difference being that we use linked lists instead of arrays, allowing us to
 * share parts of the list between elements. This allows for a much more memory
 * efficient way of associating matched rules with elements, in particular for
 * rules that match most elements, such as the universal selector or `html` and
 * `body`.
 *
 * Note that the resulting rule tree depends greatly on the order in which
 * rules are inserted, which must then be by increasing precedence. The `.foo`
 * and `.bar` selectors are not directly comparable; the example above assumes
 * that the `.bar` rule came later in the style sheet order and therefore wins
 * the cascade sort by "Order of Appearance". This information is not available
 * for the rule tree which relies on rules being fed to it in increasing
 * precedence for each element. If `.bar` came before `.foo`, the resulting tree
 * would be (notice that `.foo` is not sharable anymore):
 *
 * "div"
 * +-- ".foo"
 *     +-- ".foo[href]"   (A)
 * +-- ".bar"
 *     +-- ".foo"         (B)
 *
 * {@link http://doc.servo.org/style/rule_tree/struct.RuleTree.html}
 *
 * @privateRemarks
 * The rules tree is actually a forest of nodes since many elements do not share
 * any matched selector. We artificially root it at a fake node with no
 * declarations, hence no impact on style. The fake root is not serialized.
 *
 * @public
 */
export class RuleTree implements Serializable {
  public static empty(): RuleTree {
    return new RuleTree();
  }

  // Rooting the forest at a fake node with no declaration.
  private readonly _root: RuleTree.Node = RuleTree.Node.of(
    Block.of(h.rule.style("*", []), Universal.of(None), [], {
      origin: Origin.UserAgent,
      specificity: Specificity.empty(),
      order: Infinity,
    }),
    [],
    None,
  );

  private constructor() {}

  /**
   * Add a bunch of items to the tree. Returns the last node created, which is
   * the highest precedence node for that list of items.
   *
   * @remarks
   * The rules are assumed to be:
   * 1. all matching the same element; and
   * 2. ordered in increasing cascade sort order (lower precedence rule first); and
   * 3. be all the rules matching that element.
   *
   * It is up to the caller to ensure this is true, as the tree itself cannot
   * check that (notably, it has no access to the DOM tree to ensure the rules
   * match the same element; nor to the origin or order of the rules to check
   * cascade order).
   *
   * @privateRemarks
   * This is stateful. Adding rules to a rule tree does mutate it!
   *
   * @internal
   */
  public add(rules: Iterable<Block>): RuleTree.Node {
    let parent = this._root;

    for (const block of rules) {
      // Insert the next rule into the current parent, using the returned rule
      // entry as the parent of the next rule to insert. This way, we gradually
      // build up a path of rule entries and then return the final entry to the
      // caller.
      parent = parent.add(block);
    }

    return parent;
  }

  public toJSON(): RuleTree.JSON {
    return this._root.children.map((node) => node.toJSON());
  }
}

/**
 * @public
 */
export namespace RuleTree {
  export type JSON = Array<Node.JSON>;

  export class Node implements Serializable {
    public static of(
      block: Block,
      children: Array<Node>,
      parent: Option<Node>,
    ): Node {
      return new Node(block, children, parent);
    }

    private readonly _block: Block;
    private readonly _children: Array<Node>;
    private readonly _parent: Option<Node>;

    private constructor(
      block: Block,
      children: Array<Node>,
      parent: Option<Node>,
    ) {
      this._block = block;
      this._children = children;
      this._parent = parent;
    }

    public get block(): Block {
      return this._block;
    }

    public get children(): Array<Node> {
      return this._children;
    }

    public get parent(): Option<Node> {
      return this._parent;
    }

    public *ancestors(): Iterable<Node> {
      for (const parent of this._parent) {
        yield parent;
        yield* parent.ancestors();
      }
    }

    public *inclusiveAncestors(): Iterable<Node> {
      yield this;
      yield* this.ancestors();
    }

    /**
     * Adds style rule to a node in the tree. Returns the node where the rule
     * was added.
     *
     * @privateRemarks
     * This is stateful. Adding a rule to a node mutates the node!
     *
     * @internal
     */
    public add(block: Block): Node {
      // If we have already encountered the exact same selector (physical identity),
      // we're done.
      // This occurs when the exact same style rule matches several elements.
      // The first element added to the rule tree will add that rule, subsequent
      // ones will just reuse it (if the path so far in the rule tree has
      // completely been shared).
      // Notably, because it is the exact same selector, it controls the exact
      // same rules, so all the information is already in the tree.
      if (this._block.selector === block.selector) {
        return this;
      }

      // Otherwise, if there is a child with an identical but separate selector,
      // recursively add to it.
      // This happens, e.g., when encountering two ".foo" selectors. They are
      // then sorted by order of appearance (by assumption) and the later must
      // be a descendant of the former as it has higher precedence.
      for (const child of this._children) {
        if (child._block.selector.equals(block.selector)) {
          return child.add(block);
        }
      }

      // Otherwise, the selector is brand new (for this branch of the tree).
      // Add it as a new child and return it (further rules in the same batch,
      // matching the same element, should be added as its child.
      const node = Node.of(block, [], Option.of(this));

      this._children.push(node);

      return node;
    }

    public toJSON(): Node.JSON {
      return {
        block: this._block.toJSON(),
        children: this._children.map((node) => node.toJSON()),
      };
    }
  }

  export namespace Node {
    export interface JSON {
      [key: string]: json.JSON;
      block: Block.JSON;
      children: Array<Node.JSON>;
    }
  }
}
