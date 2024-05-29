/// <reference lib="dom" />

import { Equatable } from "@siteimprove/alfa-equatable";
import { Flags } from "@siteimprove/alfa-flags";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
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
    // The list of flags allowed to control tree traversal.
    F extends Flags.allFlags,
    // The options for serialization
    S extends Node.SerializationOptions = Node.SerializationOptions,
    // The type
    T extends string = string,
  >
  implements
    Iterable<Node<F, S>>,
    Equatable,
    Hashable,
    json.Serializable<Node.JSON<T>, S>
{
  protected readonly _children: Array<Node<F, S>>;
  protected _parent: Option<Node<F, S>> = None;
  protected readonly _type: T;

  // Externally provided data.
  private readonly _externalId: string | undefined;
  private readonly _extraData: any;

  private readonly _serializationId: string;

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

  protected constructor(
    children: Array<Node<F, S>>,
    type: T,
    externalId?: string,
    extraData?: any,
  ) {
    this._children = (children as Array<Node<F, S>>).filter((child) =>
      child._attachParent(this),
    ) as Array<Node<F, S>>;
    this._type = type;
    this._externalId = externalId;
    this._extraData = extraData;

    this._serializationId = crypto.randomUUID();
  }

  public get type(): T {
    return this._type;
  }

  public get externalId(): string | undefined {
    return this._externalId;
  }

  public get extraData(): any {
    return this._extraData;
  }

  public get serializationId(): string {
    return this._serializationId;
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
  public parent(options?: Flags<F>): Option<Node<F, S>> {
    return this._parent;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public isParentOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.parent(options).includes(this);
  }

  private _lastKnownRoot: Array<Node<F, S>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  // Since root is looking upward, it may change between calls.
  // So we cache the last known root, try again from here and update the result
  // if necessary. Once the tree is fully frozen, this only cost an extra look
  // through this.parent which is not expensive.
  public root(options?: Flags<F>): Node<F, S> {
    const value = options?.value ?? 0;
    let lastKnownRoot = this._lastKnownRoot[value] ?? this;

    for (const parent of lastKnownRoot.parent(options)) {
      lastKnownRoot = parent.root(options);
    }

    this._lastKnownRoot[value] = lastKnownRoot;
    return lastKnownRoot;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  public isRootOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.root(options) === this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public children(options?: Flags<F>): Sequence<Node<F, S>> {
    return Sequence.from(this._children);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public isChildOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.children(options).includes(this);
  }

  private _descendants: Array<Sequence<Node<F, S>>> = [];
  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  // While this is lazily built, actually generating the sequence takes time to
  // walk through the tree and resolve all the continuations.
  // Caching it saves a lot of time by generating the sequence only once.
  public descendants(options?: Flags<F>): Sequence<Node<F, S>> {
    const value = options?.value ?? 0;
    if (this._descendants[value] === undefined) {
      this._descendants[value] = this.children(options).flatMap((child) =>
        Sequence.of(
          child,
          Lazy.of(() => child.descendants(options)),
        ),
      );
    }

    return this._descendants[value];
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  public isDescendantOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.descendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public inclusiveDescendants(options?: Flags<F>): Sequence<Node<F, S>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.descendants(options)),
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public isInclusiveDescendantsOf(
    node: Node<F, S>,
    options?: Flags<F>,
  ): boolean {
    return node.inclusiveDescendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public ancestors(options?: Flags<F>): Sequence<Node<F, S>> {
    for (const parent of this.parent(options)) {
      return Sequence.of(
        parent,
        Lazy.of(() => parent.ancestors(options)),
      );
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public isAncestorOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.ancestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public inclusiveAncestors(options?: Flags<F>): Sequence<Node<F, S>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.ancestors(options)),
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public isInclusiveAncestorOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.inclusiveAncestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public siblings(options?: Flags<F>): Sequence<Node<F, S>> {
    return this.inclusiveSiblings(options).reject(equals(this));
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public isSiblingOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.siblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public inclusiveSiblings(options?: Flags<F>): Sequence<Node<F, S>> {
    for (const parent of this.parent(options)) {
      return parent.children(options);
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public isInclusiveSiblingOf(node: Node<F, S>, options?: Flags<F>): boolean {
    return node.inclusiveSiblings(options).includes(this);
  }

  private _preceding: Array<Sequence<Node<F, S>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-preceding}
   */
  // Due to reversing, this is not lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public preceding(options?: Flags<F>): Sequence<Node<F, S>> {
    const value = options?.value ?? 0;
    if (this._preceding[value] === undefined) {
      this._preceding[value] = this.inclusiveSiblings(options)
        .takeUntil(equals(this))
        .reverse();
    }

    return this._preceding[value];
  }

  private _following: Array<Sequence<Node<F, S>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-following}
   */
  // Due to skipUntil, this is not fully lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public following(options?: Flags<F>): Sequence<Node<F, S>> {
    const value = options?.value ?? 0;
    if (this._following[value] === undefined) {
      this._following[value] = this.inclusiveSiblings(options)
        .skipUntil(equals(this))
        .rest();
    }

    return this._following[value];
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-first-child}
   */
  // Sequence.first() is fast and doesn't need caching
  public first(options?: Flags<F>): Option<Node<F, S>> {
    return this.children(options).first();
  }

  private _last: Array<Option<Node<F, S>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-last-child}
   */
  // Due to last, this is not lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public last(options?: Flags<F>): Option<Node<F, S>> {
    const value = options?.value ?? 0;
    if (this._last[value] === undefined) {
      this._last[value] = this.children(options).last();
    }

    return this._last[value];
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-previous-sibling}
   */
  public previous(options?: Flags<F>): Option<Node<F, S>> {
    return this.preceding(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-next-sibling}
   */
  public next(options?: Flags<F>): Option<Node<F, S>> {
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
  public closest<T extends Node<F, S>>(
    refinement: Refinement<Node<F, S>, T>,
    options?: Flags<F>,
  ): Option<T>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<Node<F, S>>,
    options?: Flags<F>,
  ): Option<Node<F, S>>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<Node<F, S>>,
    options?: Flags<F>,
  ): Option<Node<F, S>> {
    return this.inclusiveAncestors(options).find(predicate);
  }

  public *[Symbol.iterator](): Iterator<Node<F, S>> {
    yield* this.descendants();
  }

  public equals(value: Node<F, S>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public hash(hash: Hash) {
    hash.writeObject(this);
  }

  public toJSON(options?: S): Node.JSON<T> {
    if (options?.verbosity === Node.SerializationVerbosity.IdOnly) {
      return {
        type: this._type,
        serializationId: this._serializationId,
        ...(this._externalId === undefined
          ? {}
          : { externalId: this._externalId }),
      };
    }

    return {
      type: this._type,
      children: this._children.map((child) => child.toJSON(options)),
      ...(this._externalId === undefined
        ? {}
        : { externalId: this._externalId }),
      ...(options?.includeId
        ? {
            serializationId: this._serializationId,
          }
        : {}),
    };
  }

  /**
   * @internal
   */
  public _attachParent(parent: Node<F, S>): boolean {
    if (this._frozen || this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

/**
 * @public
 */
export namespace Node {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;
    type: T;
    children?: Array<JSON>;
    externalId?: string;
    serializationId?: string;
  }

  export enum SerializationVerbosity {
    Full,
    IdOnly,
  }

  export interface SerializationOptions {
    /*
     * Specifies the verbosity of the serialization, ranging from the full object to only a serialization id.
     */
    verbosity?: SerializationVerbosity;

    /*
     * Include the serialization id when serializing. Useful for tests as the ids are randomly generated.
     *
     * @remarks
     * Will be ignored if the verbosity is IdOnly
     */
    includeId?: boolean;
  }
}
