import { Equatable } from "@siteimprove/alfa-equatable";
import { Flags } from "@siteimprove/alfa-flags";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Predicate } from "@siteimprove/alfa-predicate";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

const { equals } = Predicate;

/**
 * Model for n-ary trees with some traversal flags.
 *
 * In order to have a parent pointers, nodes are allowed to attach themselves
 * to a parent node. To prevent mutation of an existing tree, the child is then
 * "frozen".
 *
 * Since it is not possible to add children after node creation, and it is not
 * possible to re-attach an already attached node, this means that the trees are
 * effectively downward frozen. In turn, this allows a bunch of optimisation
 * since any traversal function that does not look upward can be cached.
 *
 * The full tree (all nodes) must accept the same set of traversal flags, but
 * the node type is not constrained.
 *
 * @public
 */
export abstract class Node<F extends Flags, T extends string = string>
  implements
    Iterable<Node<F>>,
    Equatable,
    earl.Serializable<Node.EARL>,
    json.Serializable<Node.JSON<T>>,
    sarif.Serializable<sarif.Location>
{
  protected readonly _children: Array<Node<F>>;
  protected _parent: Option<Node<F>> = None;
  protected readonly _type: T;

  // Need to keep a "default flags" value with the correct type for easier
  // defaulting on traversal functions.
  protected readonly _defaultFlags: F;

  /**
   * Whether or not the node is frozen.
   *
   * @remarks
   * As nodes are initialized without a parent and possibly attached to a parent
   * after construction, this makes hierarchies of nodes mutable. That is, a
   * node without a parent node may be assigned one by being passed as a child
   * to a parent node. When this happens, a node becomes frozen. Nodes can also
   * become frozen before being assigned a parent by using the `Node#freeze()`
   * method.
   */
  protected _frozen: boolean = false;

  protected constructor(children: Array<Node<F>>, type: T, defaultFlags: F) {
    this._children = children.filter((child) => child._attachParent(this));
    this._type = type;

    this._defaultFlags = defaultFlags;
  }

  public get type(): T {
    return this._type;
  }

  public get frozen(): boolean {
    return this._frozen;
  }

  /**
   * Freeze the node. This prevents further expansion of the node hierarchy,
   * meaning that the node can no longer be passed as a child to a parent node.
   */
  public freeze(): this {
    this._frozen = this._frozen || true;
    return this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public parent(options: F = this._defaultFlags): Option<Node<F>> {
    return this._parent;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public isParentOf(node: Node<F>, options: F = this._defaultFlags): boolean {
    return node.parent(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  // Since root is looking upward, it may changes between calls, so it is not
  // easy to cache. We could cache the last known root (of a frozen node) and
  // keep going up from there (updating the last known root).
  public root(options: F = this._defaultFlags): Node<F> {
    for (const parent of this.parent(options)) {
      return parent.root(options);
    }

    return this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  public isRootOf(node: Node<F>, options: F = this._defaultFlags): boolean {
    return node.root(options) === this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public children(options: F = this._defaultFlags): Sequence<Node<F>> {
    return Sequence.from(this._children);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public isChildOf(node: Node<F>, options: F = this._defaultFlags): boolean {
    return node.children(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  // Since this is lazily built, caching is pointless
  public descendants(options: F = this._defaultFlags): Sequence<Node<F>> {
    return this.children(options).flatMap((child) =>
      Sequence.of(
        child,
        Lazy.of(() => child.descendants(options))
      )
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  public isDescendantOf(
    node: Node<F>,
    options: F = this._defaultFlags
  ): boolean {
    return node.descendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public inclusiveDescendants(
    options: F = this._defaultFlags
  ): Sequence<Node<F>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.descendants(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public isInclusiveDescendantsOf(
    node: Node<F>,
    options: F = this._defaultFlags
  ): boolean {
    return node.inclusiveDescendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public ancestors(options: F = this._defaultFlags): Sequence<Node<F>> {
    for (const parent of this.parent(options)) {
      return Sequence.of(
        parent,
        Lazy.of(() => parent.ancestors(options))
      );
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public isAncestorOf(node: Node<F>, options: F = this._defaultFlags): boolean {
    return node.ancestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public inclusiveAncestors(
    options: F = this._defaultFlags
  ): Sequence<Node<F>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.ancestors(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public isInclusiveAncestorOf(
    node: Node<F>,
    options: F = this._defaultFlags
  ): boolean {
    return node.inclusiveAncestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public siblings(options: F = this._defaultFlags): Sequence<Node<F>> {
    return this.inclusiveSiblings(options).reject(equals(this));
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public isSiblingOf(node: Node<F>, options: F = this._defaultFlags): boolean {
    return node.siblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public inclusiveSiblings(options: F = this._defaultFlags): Sequence<Node<F>> {
    for (const parent of this.parent(options)) {
      return parent.children(options);
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public isInclusiveSiblingOf(
    node: Node<F>,
    options: F = this._defaultFlags
  ): boolean {
    return node.inclusiveSiblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-preceding}
   */
  // need caching
  public preceding(options: F = this._defaultFlags): Sequence<Node<F>> {
    return this.inclusiveSiblings(options).takeUntil(equals(this)).reverse();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-following}
   */
  // need caching
  public following(options: F = this._defaultFlags): Sequence<Node<F>> {
    return this.inclusiveSiblings(options).skipUntil(equals(this)).rest();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-first-child}
   */
  public first(options: F = this._defaultFlags): Option<Node<F>> {
    return this.children(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-last-child}
   */
  public last(options: F = this._defaultFlags): Option<Node<F>> {
    return this.children(options).last();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-previous-sibling}
   */
  public previous(options: F = this._defaultFlags): Option<Node<F>> {
    return this.preceding(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-next-sibling}
   */
  public next(options: F = this._defaultFlags): Option<Node<F>> {
    return this.following(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-index}
   */
  public index(options: F = this._defaultFlags): number {
    return this.preceding(options).size;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest<T extends Node<F>>(
    refinement: Refinement<Node<F>, T>,
    options?: F
  ): Option<T>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(predicate: Predicate<Node<F>>, options?: F): Option<Node<F>>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<Node<F>>,
    options: F = this._defaultFlags
  ): Option<Node<F>> {
    return this.inclusiveAncestors(options).find(predicate);
  }

  public path(): string {
    return "";
  }

  public *[Symbol.iterator](): Iterator<Node<F>> {
    yield* this.descendants();
  }

  public equals(value: Node<F>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public toJSON(): Node.JSON<T> {
    return {
      type: this._type,
    };
  }

  public toEARL(): Node.EARL {
    return {
      "@context": {
        ptr: "http://www.w3.org/2009/pointers#",
      },
      "@type": [
        "ptr:Pointer",
        "ptr:SinglePointer",
        "ptr:ExpressionPointer",
        "ptr:XPathPointer",
      ],
      "ptr:expression": this.path(),
    };
  }

  public toSARIF(): sarif.Location {
    return {
      logicalLocations: [
        {
          fullyQualifiedName: this.path(),
        },
      ],
    };
  }

  /**
   * @internal
   */
  public _attachParent(parent: Node<F>): boolean {
    if (this._frozen || this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

export namespace Node {
  export interface EARL extends earl.EARL {
    "@context": {
      ptr: "http://www.w3.org/2009/pointers#";
    };
    "@type": [
      "ptr:Pointer",
      "ptr:SinglePointer",
      "ptr:ExpressionPointer",
      "ptr:XPathPointer"
    ];
    "ptr:expression": string;
    "ptr:reference"?: {
      "@id": string;
    };
  }

  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;
    type: T;
  }

  export function isNode<F extends Flags>(value: unknown): value is Node<F> {
    return value instanceof Node;
  }
}
