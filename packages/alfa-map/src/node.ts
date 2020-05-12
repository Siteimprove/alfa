import { Bits } from "@siteimprove/alfa-bits";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Status } from "./status";

const { bit, take, skip, test, set, clear, popCount } = Bits;

/**
 * @internal
 */
export interface Node<K, V> extends Functor<V>, Iterable<[K, V]>, Equatable {
  isEmpty(): this is Empty;
  isLeaf(): this is Leaf<K, V>;
  get(key: K, hash: number, shift: number): Option<V>;
  set(key: K, value: V, hash: number, shift: number): Status<Node<K, V>>;
  delete(key: K, hash: number, shift: number): Status<Node<K, V>>;
  map<U>(mapper: Mapper<V, U, [K]>): Node<K, U>;
}

/**
 * @internal
 */
export namespace Node {
  export const Bits = 5;

  export function fragment(hash: number, shift: number): number {
    return take(skip(hash, shift), Bits);
  }

  export function index(fragment: number, mask: number): number {
    return popCount(take(mask, fragment));
  }
}

/**
 * @internal
 */
export interface Empty extends Node<never, never> {}

/**
 * @internal
 */
export const Empty: Empty = new (class Empty {
  public isEmpty(): this is Empty {
    return true;
  }

  public isLeaf(): this is Leaf<never, never> {
    return false;
  }

  public get(): None {
    return None;
  }

  public set<K, V>(key: K, value: V, hash: number): Status<Node<K, V>> {
    return Status.created(Leaf.of(hash, key, value));
  }

  public delete<K, V>(): Status<Node<K, V>> {
    return Status.unchanged(this);
  }

  public map(): Empty {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Empty;
  }

  public *[Symbol.iterator](): Iterator<never> {}
})();

/**
 * @internal
 */
export class Leaf<K, V> implements Node<K, V> {
  public static of<K, V>(hash: number, key: K, value: V): Leaf<K, V> {
    return new Leaf(hash, key, value);
  }

  private readonly _hash: number;
  private readonly _key: K;
  private readonly _value: V;

  private constructor(hash: number, key: K, value: V) {
    this._hash = hash;
    this._key = key;
    this._value = value;
  }

  public get key(): K {
    return this._key;
  }

  public get value(): V {
    return this._value;
  }

  public isEmpty(): this is Empty {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return true;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    return hash === this._hash && Equatable.equals(key, this._key)
      ? Option.of(this._value)
      : None;
  }

  public set(
    key: K,
    value: V,
    hash: number,
    shift: number
  ): Status<Node<K, V>> {
    if (hash === this._hash) {
      if (Equatable.equals(key, this._key)) {
        if (Equatable.equals(value, this._value)) {
          return Status.unchanged(this);
        }

        return Status.updated(Leaf.of(hash, key, value));
      }

      return Status.created(
        Collision.of(hash, [this, Leaf.of(hash, key, value)])
      );
    }

    const fragment = Node.fragment(this._hash, shift);

    return Sparse.of(bit(fragment), [this]).set(key, value, hash, shift);
  }

  public delete(key: K, hash: number): Status<Node<K, V>> {
    return hash === this._hash && Equatable.equals(key, this._key)
      ? Status.deleted(Empty)
      : Status.unchanged(this);
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Leaf<K, U> {
    return Leaf.of(this._hash, this._key, mapper(this._value, this._key));
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Leaf &&
      value._hash === this._hash &&
      Equatable.equals(value._key, this._key) &&
      Equatable.equals(value._value, this._value)
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    yield [this._key, this._value];
  }
}

/**
 * @internal
 */
export class Collision<K, V> implements Node<K, V> {
  public static of<K, V>(
    hash: number,
    nodes: Array<Leaf<K, V>>
  ): Collision<K, V> {
    return new Collision(hash, nodes);
  }

  private readonly _hash: number;
  private readonly _nodes: Array<Leaf<K, V>>;

  private constructor(hash: number, nodes: Array<Leaf<K, V>>) {
    this._hash = hash;
    this._nodes = nodes;
  }

  public isEmpty(): this is Empty {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return false;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    if (hash === this._hash) {
      for (const node of this._nodes) {
        const value = node.get(key, hash, shift);

        if (value.isSome()) {
          return value;
        }
      }
    }

    return None;
  }

  public set(
    key: K,
    value: V,
    hash: number,
    shift: number
  ): Status<Node<K, V>> {
    if (hash === this._hash) {
      for (let i = 0, n = this._nodes.length; i < n; i++) {
        const node = this._nodes[i];

        if (Equatable.equals(key, node.key)) {
          if (Equatable.equals(value, node.value)) {
            return Status.unchanged(this);
          }

          return Status.updated(
            Collision.of(
              this._hash,
              replace(this._nodes, i, Leaf.of(hash, key, value))
            )
          );
        }
      }

      return Status.created(
        Collision.of(this._hash, this._nodes.concat(Leaf.of(hash, key, value)))
      );
    }

    const fragment = Node.fragment(this._hash, shift);

    return Sparse.of(bit(fragment), [this]).set(key, value, hash, shift);
  }

  public delete(key: K, hash: number): Status<Node<K, V>> {
    if (hash === this._hash) {
      for (let i = 0, n = this._nodes.length; i < n; i++) {
        const node = this._nodes[i];

        if (Equatable.equals(key, node.key)) {
          const nodes = remove(this._nodes, i);

          if (nodes.length === 1) {
            return Status.deleted(nodes[0]);
          }

          return Status.deleted(Collision.of(this._hash, nodes));
        }
      }
    }

    return Status.unchanged(this);
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Collision<K, U> {
    return Collision.of(
      this._hash,
      this._nodes.map((node) => node.map(mapper))
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Collision &&
      value._hash === this._hash &&
      value._nodes.length === this._nodes.length &&
      value._nodes.every((node, i) => node.equals(this._nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    for (const node of this._nodes) {
      yield* node;
    }
  }
}

/**
 * @internal
 */
export class Sparse<K, V> implements Node<K, V> {
  public static of<K, V>(mask: number, nodes: Array<Node<K, V>>): Sparse<K, V> {
    return new Sparse(mask, nodes);
  }

  private readonly _mask: number;
  private readonly _nodes: Array<Node<K, V>>;

  private constructor(mask: number, nodes: Array<Node<K, V>>) {
    this._mask = mask;
    this._nodes = nodes;
  }

  public isEmpty(): this is Empty {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return false;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    const fragment = Node.fragment(hash, shift);

    if (test(this._mask, fragment)) {
      const index = Node.index(fragment, this._mask);

      return this._nodes[index].get(key, hash, shift + Node.Bits);
    }

    return None;
  }

  public set(
    key: K,
    value: V,
    hash: number,
    shift: number
  ): Status<Node<K, V>> {
    const fragment = Node.fragment(hash, shift);
    const index = Node.index(fragment, this._mask);

    if (test(this._mask, fragment)) {
      const { result: node, status } = this._nodes[index].set(
        key,
        value,
        hash,
        shift + Node.Bits
      );

      if (status === "unchanged") {
        return Status.unchanged(this);
      }

      return Status.updated(
        Sparse.of(this._mask, replace(this._nodes, index, node))
      );
    }

    return Status.created(
      Sparse.of(
        set(this._mask, fragment),
        insert(this._nodes, index, Leaf.of(hash, key, value))
      )
    );
  }

  public delete(key: K, hash: number, shift: number): Status<Node<K, V>> {
    const fragment = Node.fragment(hash, shift);

    if (test(this._mask, fragment)) {
      const index = Node.index(fragment, this._mask);

      const { result: node, status } = this._nodes[index].delete(
        key,
        hash,
        shift + Node.Bits
      );

      if (status === "unchanged") {
        return Status.unchanged(this);
      }

      if (node.isEmpty()) {
        const nodes = remove(this._nodes, index);

        if (nodes.length === 1) {
          return Status.deleted(nodes[0]);
        }

        return Status.deleted(Sparse.of(clear(this._mask, fragment), nodes));
      }

      return Status.deleted(
        Sparse.of(this._mask, replace(this._nodes, index, node))
      );
    }

    return Status.unchanged(this);
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Sparse<K, U> {
    return Sparse.of(
      this._mask,
      this._nodes.map((node) => node.map(mapper))
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Sparse &&
      value._mask === this._mask &&
      value._nodes.length === this._nodes.length &&
      value._nodes.every((node, i) => node.equals(this._nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    for (const node of this._nodes) {
      yield* node;
    }
  }
}

function insert<T>(
  array: Readonly<Array<T>>,
  index: number,
  value: T
): Array<T> {
  const result = new Array(array.length + 1);

  result[index] = value;

  for (let i = 0, n = index; i < n; i++) {
    result[i] = array[i];
  }

  for (let i = index, n = array.length; i < n; i++) {
    result[i + 1] = array[i];
  }

  return result;
}

function remove<T>(array: Readonly<Array<T>>, index: number): Array<T> {
  const result = new Array(array.length - 1);

  for (let i = 0, n = index; i < n; i++) {
    result[i] = array[i];
  }

  for (let i = index, n = result.length; i < n; i++) {
    result[i] = array[i + 1];
  }

  return result;
}

function replace<T>(
  array: Readonly<Array<T>>,
  index: number,
  value: T
): Array<T> {
  const result = array.slice(0);
  result[index] = value;
  return result;
}
