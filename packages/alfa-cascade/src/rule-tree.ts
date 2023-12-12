import { Declaration, Rule } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Selector } from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

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
 *      +-- ".foo[href]"    <- A
 *
 * We then associate rule `".foo[href]"` with element A and insert the matched
 * rules for element B into the tree:
 *
 *  "div"
 *  +-- ".foo"
 *      +-- ".foo[href]"    <- A
 *      +-- ".bar"          <- B
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
 * and `.bar` selectors are not directly comparable, the example above assumes
 * that the `.bar` rule came later in the style sheet order and therefore wins
 * the cascade sort by "Order of Appearance". This information is not available
 * for the rule tree which relies on rules being fed to it in increasing
 * precedence for each element. If `.bar` came before `.foo`, the resulting tree
 * would be:
 *
 * "div"
 * +-- ".foo"
 *     +-- ".foo[href]"   <- A
 * +-- ".bar"
 *     +-- ".foo"         <- B
 *
 * {@link http://doc.servo.org/style/rule_tree/struct.RuleTree.html}
 *
 * @privateRemarks
 * The rules tree is actually a forest of nodes since many elements do not share
 * any matched selector. We do not artificially root it as it would add little
 * value, there is no natural root, and creating a fake root would actually
 * make processing the tree harder (as we would need to handle that fake node).
 * As a consequence, when inserting new rules in the tree, we may start a
 * completely new tree in that forest. This means that rules may be inserted
 * without a parent, and adding a single rule must be a static method of the
 * Node class, rater than an instance method.
 *
 * @public
 */
export class RuleTree implements Serializable {
  public static empty(): RuleTree {
    return new RuleTree();
  }

  // Keeping this allow a more streamlined tree vocabulary later on.
  private readonly _root: Option<RuleTree.Node> = None;
  private readonly _children: Array<RuleTree.Node> = [];

  private constructor() {}

  /**
   * Add a bunch of items to the tree.
   *
   * @remarks
   * The rules are assumed to be:
   * 1. all matching the same element; and
   * 2. ordered in increasing cascade sort order (lower precedence rule first); and
   * 3. be all the rules matching that element (this is not problematic).
   *
   * It is up to the caller to ensure this is true, as the tree itself cannot
   * check that (notably, it has no access to the DOM tree to ensure the rule
   * match the same element; nor to the origin or order of the rules to check
   * cascade order).
   */
  public add(rules: Iterable<RuleTree.Item>): Option<RuleTree.Node> {
    let parent = this._root;
    let children = this._children;

    for (const item of rules) {
      // Insert the next rule into the current parent, using the returned rule
      // entry as the parent of the next rule to insert. This way, we gradually
      // build up a path of rule entries and then return the final entry to the
      // caller.
      // Because all rules match the same element (by calling assumption), we
      // do want to build them as a single path into the tree (baring some sharing).
      // So each rule essentially creates a child of the preceding one.
      parent = Option.of(RuleTree.Node.add(item, children, parent));

      // parent was just build as a non-None Option.
      children = parent.getUnsafe().children;
    }

    return parent;
  }

  public toJSON(): RuleTree.JSON {
    return this._children.map((node) => node.toJSON());
  }
}

/**
 * @public
 */
export namespace RuleTree {
  export type JSON = Array<Node.JSON>;

  /**
   * Items stored in rule tree nodes.
   *
   * @remarks
   * Only the selector is used to actually build the structure. The rule and
   * declarations are just data passed along to be used when resolving style.
   */
  export interface Item {
    rule: Rule;
    selector: Selector;
    declarations: Iterable<Declaration>;
  }

  export namespace Item {
    export interface JSON {
      [key: string]: json.JSON;
      rule: Rule.JSON;
      selector: Selector.JSON;
      declarations: Array<Declaration.JSON>;
    }
  }

  export class Node implements Serializable {
    public static of(
      { rule, selector, declarations }: Item,
      children: Array<Node>,
      parent: Option<Node>,
    ): Node {
      return new Node(rule, selector, declarations, children, parent);
    }

    private readonly _rule: Rule;
    private readonly _selector: Selector;
    private readonly _declarations: Iterable<Declaration>;
    private readonly _children: Array<Node>;
    private readonly _parent: Option<Node>;

    private constructor(
      rule: Rule,
      selector: Selector,
      declarations: Iterable<Declaration>,
      children: Array<Node>,
      parent: Option<Node>,
    ) {
      this._rule = rule;
      this._selector = selector;
      this._declarations = declarations;
      this._children = children;
      this._parent = parent;
    }

    public get rule(): Rule {
      return this._rule;
    }

    public get selector(): Selector {
      return this._selector;
    }

    public get declarations(): Iterable<Declaration> {
      return this._declarations;
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
     * Adds style rule to a potential node in the tree. Returns the node where
     * the rule was added.
     *
     * @remarks
     *
     * Initially (for each element), the potential parent is None as
     * it is possible to create a new tree in the forest. The forest itself
     * is the children.
     */
    public static add(
      item: Item,
      children: Array<Node>,
      parent: Option<Node>,
    ): Node {
      // If we have already encountered the exact same selector (physical identity),
      // we're done.
      // This occurs when the exact same style rule matches several elements.
      // The first element added to the rule tree will add that rule, subsequent
      // one will just reuse it. (this also only occurs if the path so far in
      // the rule tree has completely been shared so far).
      // Notably, because it is the exact same selector, it controls the exact
      // same rules, so all the information is already in the tree.
      if (parent.some((parent) => parent._selector === item.selector)) {
        return parent.get();
      }

      // Otherwise, if there is a child with a selector that looks the same,
      // recursively add to it.
      // This happens, e.g., when encountering two ".foo" selectors. They are
      // then sorted by order of appearance (by assumption) and the later must
      // be a descendant of the former as it has higher precedence.
      for (const child of children) {
        if (child._selector.equals(item.selector)) {
          return this.add(item, child._children, Option.of(child));
        }
      }

      // Otherwise, the selector is brand new (for this branch of the tree).
      // Add it as a new child and return it (further rules in the same batch,
      // matching the same element, should be added as its child.
      const node = Node.of(item, [], parent);

      children.push(node);

      return node;
    }

    public toJSON(): Node.JSON {
      return {
        item: {
          rule: this._rule.toJSON(),
          selector: this._selector.toJSON(),
          declarations: [...this._declarations].map((declaration) =>
            declaration.toJSON(),
          ),
        },
        children: this._children.map((node) => node.toJSON()),
      };
    }
  }

  export namespace Node {
    export interface JSON {
      [key: string]: json.JSON;
      item: Item.JSON;
      children: Array<Node.JSON>;
    }
  }
}
