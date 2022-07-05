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
  // The type of nodes
  T extends string = string,
  // Allowed namespace for system ids
  N extends string = string
> implements Iterable<Node<F>>, Equatable, json.Serializable<Node.JSON<T>>
{
  protected readonly _children: Array<Node<F>>;
  protected _parent: Option<Node<F>> = None;
  protected readonly _type: T;
  private readonly _nodeId: Node.Id.System<N> | Node.Id.User;

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
    children: Array<Node<F>>,
    type: T,
    nodeId: Node.Id.System<N> | Node.Id.User
  ) {
    this._children = (children as Array<Node<F>>).filter((child) =>
      child._attachParent(this)
    ) as Array<Node<F>>;
    this._type = type;
    this._nodeId = nodeId;
  }

  public get type(): T {
    return this._type;
  }

  public get nodeId(): Node.Id.System<N> | Node.Id.User {
    return this._nodeId;
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
  public parent(options?: Flags<F>): Option<Node<F>> {
    return this._parent;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public isParentOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.parent(options).includes(this);
  }

  private _lastKnownRoot: Array<Node<F>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  // Since root is looking upward, it may change between calls.
  // So we cache the last known root, try again from here and update the result
  // if necessary. Once the tree is fully frozen, this only cost an extra look
  // through this.parent which is not expensive.
  public root(options?: Flags<F>): Node<F> {
    let lastKnownRoot = this._lastKnownRoot[options?.value ?? 0] ?? this;

    for (const parent of lastKnownRoot.parent(options)) {
      lastKnownRoot = parent.root(options);
    }

    this._lastKnownRoot[options?.value ?? 0] = lastKnownRoot;
    return lastKnownRoot;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-root}
   */
  public isRootOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.root(options) === this;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public children(options?: Flags<F>): Sequence<Node<F>> {
    return Sequence.from(this._children);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public isChildOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.children(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  public descendants(options?: Flags<F>): Sequence<Node<F>> {
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
  public isDescendantOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.descendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public inclusiveDescendants(options?: Flags<F>): Sequence<Node<F>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.descendants(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant}
   */
  public isInclusiveDescendantsOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.inclusiveDescendants(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-ancestor}
   */
  public ancestors(options?: Flags<F>): Sequence<Node<F>> {
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
  public isAncestorOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.ancestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public inclusiveAncestors(options?: Flags<F>): Sequence<Node<F>> {
    return Sequence.of(
      this,
      Lazy.of(() => this.ancestors(options))
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor}
   */
  public isInclusiveAncestorOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.inclusiveAncestors(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public siblings(options?: Flags<F>): Sequence<Node<F>> {
    return this.inclusiveSiblings(options).reject(equals(this));
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-sibling}
   */
  public isSiblingOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.siblings(options).includes(this);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public inclusiveSiblings(options?: Flags<F>): Sequence<Node<F>> {
    for (const parent of this.parent(options)) {
      return parent.children(options);
    }

    return Sequence.empty();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling}
   */
  public isInclusiveSiblingOf(node: Node<F>, options?: Flags<F>): boolean {
    return node.inclusiveSiblings(options).includes(this);
  }

  private _preceding: Array<Sequence<Node<F>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-preceding}
   */
  // Due to reversing, this is not lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public preceding(options?: Flags<F>): Sequence<Node<F>> {
    if (this._preceding[options?.value ?? 0] === undefined) {
      this._preceding[options?.value ?? 0] = this.inclusiveSiblings(options)
        .takeUntil(equals(this))
        .reverse();
    }

    return this._preceding[options?.value ?? 0];
  }

  private _following: Array<Sequence<Node<F>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-following}
   */
  // Due to skipUntil, this is not fully lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public following(options?: Flags<F>): Sequence<Node<F>> {
    if (this._following[options?.value ?? 0] === undefined) {
      this._following[options?.value ?? 0] = this.inclusiveSiblings(options)
        .skipUntil(equals(this))
        .rest();
    }

    return this._following[options?.value ?? 0];
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-first-child}
   */
  // Sequence.first() is fast and doesn't need caching
  public first(options?: Flags<F>): Option<Node<F>> {
    return this.children(options).first();
  }

  private _last: Array<Option<Node<F>>> = [];

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-last-child}
   */
  // Due to last, this is not lazy and is costly at build time.
  // This only looks in frozen parts of the tree.
  public last(options?: Flags<F>): Option<Node<F>> {
    if (this._last[options?.value ?? 0] === undefined) {
      this._last[options?.value ?? 0] = this.children(options).last();
    }

    return this._last[options?.value ?? 0];
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-previous-sibling}
   */
  public previous(options?: Flags<F>): Option<Node<F>> {
    return this.preceding(options).first();
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-next-sibling}
   */
  public next(options?: Flags<F>): Option<Node<F>> {
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
  public closest<T extends Node<F>>(
    refinement: Refinement<Node<F>, T>,
    options?: Flags<F>
  ): Option<T>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<Node<F>>,
    options?: Flags<F>
  ): Option<Node<F>>;

  /**
   * {@link https://dom.spec.whatwg.org/#dom-element-closest}
   */
  public closest(
    predicate: Predicate<Node<F>>,
    options?: Flags<F>
  ): Option<Node<F>> {
    return this.inclusiveAncestors(options).find(predicate);
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
      children: this._children.map((child) => child.toJSON()),
      nodeId: this._nodeId.toJSON(),
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

/**
 * @public
 */
export namespace Node {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;
    type: T;
    children?: Array<JSON>;
    // We need nodeId to be optional since this type is used as input for
    // deserialising functions where nodeId may be absent (for system ids).
    nodeId?: Id.JSON;
  }

  /**
   * @internal
   */
  export abstract class Id<
    K extends Id.Kind,
    T extends string = string,
    N extends string = string
  > implements Equatable, Hashable, json.Serializable<Id.JSON<T, N>>
  {
    protected readonly _kind: K;
    protected readonly _type: T;
    protected readonly _namespace: N;
    protected readonly _id: number;

    protected constructor(kind: K, type: T, namespace: N, id: number) {
      this._kind = kind;
      this._type = type;
      this._namespace = namespace;
      this._id = id;
    }

    public get kind(): K {
      return this._kind;
    }

    public get type(): T {
      return this._type;
    }

    public get namespace(): N {
      return this._namespace;
    }

    public get id(): number {
      return this._id;
    }

    public equals(value: Id<Id.Kind>): value is this;

    public equals(value: unknown): boolean;

    public equals(value: unknown): boolean {
      return (
        value instanceof Id &&
        value._kind === this._kind &&
        value._type === this._type &&
        value._namespace === this._namespace &&
        value._id === this._id
      );
    }

    public hash(hash: Hash) {
      hash.writeString(this._type);
      hash.writeString(this._namespace);
      hash.writeNumber(this._id);
    }

    public toString(): string {
      return `${this._kind}:${this._type}:${this._namespace}:${this._id}`;
    }

    public toJSON(): Id.JSON<T, N> {
      // Node ID are *always* serialised as user ID.
      // This avoids collision with freshly generated system ID when deserialising.
      return { type: this._type, namespace: this._namespace, id: this._id };
    }
  }

  /**
   * @internal
   */
  export namespace Id {
    export enum Kind {
      System = "alfa",
      User = "user",
    }

    // Kind is never serialised, Node id are *always* serialised as user ID.
    export interface JSON<
      T extends string = string,
      N extends string = string
    > {
      [key: string]: json.JSON;

      type: T;
      namespace: N;
      id: number;
    }

    /**
     * @public
     */
    export class User<
      T extends string = string,
      N extends string = string
    > extends Id<Kind.User, T, N> {
      public static of(id: number): User<"", "">;

      public static of<T extends string = string>(
        type: T,
        id: number
      ): User<T, "">;

      public static of<T extends string = string, N extends string = string>(
        type: T,
        namespace: N,
        id: number
      ): User<T, N>;

      public static of<T extends string = string, N extends string = string>(
        typeOrId: T | number,
        namespaceOrId?: N | number,
        id?: number
      ): User {
        if (id !== undefined) {
          // We have all three parameters
          return new User(typeOrId as T, namespaceOrId as N, id);
        }

        if (namespaceOrId !== undefined) {
          // We have two parameters: type and id.
          return new User(typeOrId as T, "", namespaceOrId as number);
        }

        // We only have one parameter: id
        return new User("", "", typeOrId as number);
      }

      protected constructor(type: T, namespace: N, id: number) {
        super(Kind.User, type, namespace, id);
      }

      public static fromId<
        T extends string = string,
        N extends string = string
      >(json: Id.JSON<T, N>): User<T, N> {
        return new User(json.type, json.namespace, json.id);
      }
    }

    /**
     * @public
     */
    export namespace User {
      export function isUser(value: Id<Kind>): value is User;

      export function isUser(value: unknown): value is User;

      export function isUser(value: unknown): value is User {
        return value instanceof User;
      }
    }

    export const { of: user, isUser } = User;

    /**
     * @internal
     */
    export abstract class System<
      T extends string = string,
      N extends string = string
    > extends Id<Kind.System, `alfa-${T}`, N> {
      protected constructor(type: T, namespace: N, id: number) {
        super(Kind.System, `alfa-${type}`, namespace, id);
      }
    }

    /**
     * @internal
     */
    export namespace System {
      export function isSystem(value: Id<Kind>): value is System;

      export function isSystem(value: unknown): value is System;

      export function isSystem(value: unknown): value is System {
        return value instanceof System;
      }
    }

    export const { isSystem } = System;
  }
}
