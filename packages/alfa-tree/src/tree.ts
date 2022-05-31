import { Equatable } from "@siteimprove/alfa-equatable";
import { Flags } from "@siteimprove/alfa-flags";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Predicate } from "@siteimprove/alfa-predicate";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

const { equals } = Refinement;

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
export abstract class Node<
  // The type of nodes allowed in the tree. Nodes must all be subtype of it.
  // Subtyping allow mixed trees (e.g. Document, Element and Attributes).
  // The typing is a bit wonky here since we actually also want `this` to
  // extend `N`, but there is no clean way to express it :-/
  N extends Node<N, F>,
  // The list of flags allowed to control tree traversal.
  F extends Flags.allFlags,
  // The type
  T extends string = string
> implements Iterable<Node<N, F>>, Equatable, json.Serializable<Node.JSON<T>>
{
  protected readonly _children: Array<N>;
  protected _parent: Option<N> = None;
  protected readonly _type: T;

  /**
   * Whether the node is frozen.
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

  protected constructor(children: Array<N>, type: T) {
    this._children = (children as Array<Node<N | this, F>>).filter((child) =>
      child._attachParent(this)
    ) as Array<N>;
    this._type = type;
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
  public parent(options?: Flags<F>): Option<N> {
    return this._parent;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public isParentOf(node: Node<Node<N, F>, F>, options?: Flags<F>): boolean {
    return node.parent(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  // Since root is looking upward, it may change between calls, so it is not
  // easy to cache. We could cache the last known root (of a frozen node) and
  // keep going up from there (updating the last known root).
  public root(options?: Flags<F>): N | this {
    for (const parent of this.parent(options)) {
      return parent.root(options);
    }

    return this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  public isRootOf(node: Node<N, F>, options?: Flags<F>): boolean {
    return node.root(options) === this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public children(options?: Flags<F>): Sequence<N> {
    return Sequence.from(this._children);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public isChildOf(node: Node<Node<N, F>, F>, options?: Flags<F>): boolean {
    return node.children(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  public descendants(options?: Flags<F>): Sequence<N> {
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
    node: Node<Node<N, F>, F>,
    options?: Flags<F>
  ): boolean {
    return node.descendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public inclusiveDescendants(options?: Flags<F>): Sequence<N | this> {
    return Sequence.of<N | this>(
      this,
      Lazy.of(() => this.descendants(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public isInclusiveDescendantsOf(
    node: Node<N, F>,
    options?: Flags<F>
  ): boolean {
    return node.inclusiveDescendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public ancestors(options?: Flags<F>): Sequence<N> {
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
  public isAncestorOf(node: Node<Node<N, F>, F>, options?: Flags<F>): boolean {
    return node.ancestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public inclusiveAncestors(options?: Flags<F>): Sequence<N | this> {
    return Sequence.of<N | this>(
      this,
      Lazy.of(() => this.ancestors(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public isInclusiveAncestorOf(node: Node<N, F>, options?: Flags<F>): boolean {
    return node.inclusiveAncestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public siblings(options?: Flags<F>): Sequence<N> {
    return this.inclusiveSiblings(options).reject(equals(this));
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public isSiblingOf(node: Node<Node<N, F>, F>, options?: Flags<F>): boolean {
    return node.siblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public inclusiveSiblings(options?: Flags<F>): Sequence<N | this> {
    for (const parent of this.parent(options)) {
      return parent.children(options);
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public isInclusiveSiblingOf(node: Node<N, F>, options?: Flags<F>): boolean {
    return node.inclusiveSiblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-preceding}
   */
  // need caching
  public preceding(options?: Flags<F>): Sequence<N> {
    return (
      this.inclusiveSiblings(options)
        .takeUntil(equals(this))
        // There is only one inclusive sibling whose type is Node<N, F> and we
        // stop just before, so the result has type N
        .reverse() as Sequence<N>
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-following}
   */
  // need caching
  public following(options?: Flags<F>): Sequence<N> {
    return (
      this.inclusiveSiblings(options)
        .skipUntil(equals(this))
        // There is only one inclusive sibling whose type is Node<N, F> and we
        // start just after, so the result has type N
        .rest() as Sequence<N>
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-first-child}
   */
  public first(options?: Flags<F>): Option<N> {
    return this.children(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-last-child}
   */
  public last(options?: Flags<F>): Option<N> {
    return this.children(options).last();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-previous-sibling}
   */
  public previous(options?: Flags<F>): Option<N> {
    return this.preceding(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-next-sibling}
   */
  public next(options?: Flags<F>): Option<N> {
    return this.following(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-index}
   */
  public index(options?: Flags<F>): number {
    return this.preceding(options).size;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest<T extends N | this>(
    refinement: Refinement<N | this, T>,
    options?: Flags<F>
  ): Option<T>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<N | this>,
    options?: Flags<F>
  ): Option<N | this>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<N | this>,
    options?: Flags<F>
  ): Option<N | this> {
    return this.inclusiveAncestors(options).find(predicate);
  }

  public *[Symbol.iterator](): Iterator<N> {
    yield* this.descendants();
  }

  public equals(value: Node<N, F>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public toJSON(): Node.JSON<T> {
    return {
      type: this._type,
    };
  }

  /**
   * @internal
   */
  public _attachParent(parent: N): boolean {
    if (this._frozen || this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

export namespace Node {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;
    type: T;
  }
}
