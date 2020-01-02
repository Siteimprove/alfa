import { Bits } from "@siteimprove/alfa-bits";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

const { bit, take, skip, test, set, clear, popCount } = Bits;

/**
 * @internal
 */
export interface Node<K, V> extends Functor<V>, Iterable<[K, V]>, Equatable {
  isEmpty(): this is Empty<K, V>;
  isLeaf(): this is Leaf<K, V>;
  get(key: K, hash: number, shift: number): Option<V>;
  set(key: K, hash: number, shift: number, value: V): Node<K, V>;
  delete(key: K, hash: number, shift: number): Node<K, V>;
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
export class Empty<K, V> implements Node<K, V> {
  public static of<K, V>(): Empty<K, V> {
    return new Empty();
  }

  private constructor() {}

  public isEmpty(): this is Empty<K, V> {
    return true;
  }

  public isLeaf(): this is Leaf<K, V> {
    return false;
  }

  public get(): None {
    return None;
  }

  public set(key: K, hash: number, shift: number, value: V): Leaf<K, V> {
    return Leaf.of(hash, key, value);
  }

  public delete(): this {
    return this;
  }

  public map<U>(): Empty<K, U> {
    return new Empty();
  }

  public equals(value: unknown): value is this {
    return value instanceof Empty;
  }

  public *[Symbol.iterator](): Iterator<never> {}
}

/**
 * @internal
 */
export class Leaf<K, V> implements Node<K, V> {
  public static of<K, V>(hash: number, key: K, value: V): Leaf<K, V> {
    return new Leaf(hash, key, value);
  }

  public readonly hash: number;
  public readonly key: K;
  public readonly value: V;

  private constructor(hash: number, key: K, value: V) {
    this.hash = hash;
    this.key = key;
    this.value = value;
  }

  public isEmpty(): this is Empty<K, V> {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return true;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    return hash === this.hash && Equatable.equals(key, this.key)
      ? Option.of(this.value)
      : None;
  }

  public set(
    key: K,
    hash: number,
    shift: number,
    value: V
  ): Leaf<K, V> | Collision<K, V> | Sparse<K, V> {
    if (hash === this.hash) {
      const leaf = Leaf.of(hash, key, value);

      return Equatable.equals(key, this.key)
        ? leaf
        : Collision.of(hash, [this, leaf]);
    }

    const fragment = Node.fragment(this.hash, shift);

    return Sparse.of(bit(fragment), [this]).set(key, hash, shift, value);
  }

  public delete(key: K, hash: number, shift: number): Leaf<K, V> | Empty<K, V> {
    return hash === this.hash && Equatable.equals(key, this.key)
      ? Empty.of()
      : this;
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Leaf<K, U> {
    return Leaf.of(this.hash, this.key, mapper(this.value, this.key));
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Leaf &&
      value.hash === this.hash &&
      Equatable.equals(value.key, this.key) &&
      Equatable.equals(value.value, this.value)
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    yield [this.key, this.value];
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

  public readonly hash: number;
  public readonly nodes: Array<Leaf<K, V>>;

  private constructor(hash: number, nodes: Array<Leaf<K, V>>) {
    this.hash = hash;
    this.nodes = nodes;
  }

  public isEmpty(): this is Empty<K, V> {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return false;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    for (const node of this.nodes) {
      const value = node.get(key, hash, shift);

      if (value.isSome()) {
        return value;
      }
    }

    return None;
  }

  public set(key: K, hash: number, shift: number, value: V): Collision<K, V> {
    const leaf = Leaf.of(hash, key, value);

    for (let i = 0, n = this.nodes.length; i < n; i++) {
      const node = this.nodes[i];

      if (Equatable.equals(key, node.key)) {
        return Collision.of(this.hash, replace(this.nodes, i, leaf));
      }
    }

    return Collision.of(
      this.hash,
      this.nodes.concat(Leaf.of(hash, key, value))
    );
  }

  public delete(
    key: K,
    hash: number,
    shift: number
  ): Collision<K, V> | Empty<K, V> {
    for (let i = 0, n = this.nodes.length; i < n; i++) {
      const node = this.nodes[i];

      if (Equatable.equals(key, node.key)) {
        if (this.nodes.length === 1) {
          return Empty.of();
        }

        return Collision.of(this.hash, remove(this.nodes, i));
      }
    }

    return this;
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Collision<K, U> {
    return Collision.of(
      this.hash,
      this.nodes.map(node => node.map(mapper))
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Collision &&
      value.hash === this.hash &&
      value.nodes.length === this.nodes.length &&
      value.nodes.every((node, i) => node.equals(this.nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    for (const node of this.nodes) {
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

  public readonly mask: number;
  public readonly nodes: Array<Node<K, V>>;

  private constructor(mask: number, nodes: Array<Node<K, V>>) {
    this.mask = mask;
    this.nodes = nodes;
  }

  public isEmpty(): this is Empty<K, V> {
    return false;
  }

  public isLeaf(): this is Leaf<K, V> {
    return false;
  }

  public get(key: K, hash: number, shift: number): Option<V> {
    const fragment = Node.fragment(hash, shift);

    if (test(this.mask, fragment)) {
      const index = Node.index(fragment, this.mask);

      return this.nodes[index].get(key, hash, shift + Node.Bits);
    }

    return None;
  }

  public set(key: K, hash: number, shift: number, value: V): Sparse<K, V> {
    const fragment = Node.fragment(hash, shift);
    const index = Node.index(fragment, this.mask);

    if (test(this.mask, fragment)) {
      return Sparse.of(
        this.mask,
        replace(
          this.nodes,
          index,
          this.nodes[index].set(key, hash, shift + Node.Bits, value)
        )
      );
    }

    return Sparse.of(
      set(this.mask, fragment),
      insert(this.nodes, index, Leaf.of(hash, key, value))
    );
  }

  public delete(
    key: K,
    hash: number,
    shift: number
  ): Sparse<K, V> | Leaf<K, V> | Empty<K, V> {
    const fragment = Node.fragment(hash, shift);

    if (test(this.mask, fragment)) {
      const index = Node.index(fragment, this.mask);

      const node = this.nodes[index].delete(key, hash, shift + Node.Bits);

      if (node.isEmpty()) {
        if (this.nodes.length === 1) {
          return Empty.of();
        }

        return Sparse.of(clear(this.mask, fragment), remove(this.nodes, index));
      }

      if (node.isLeaf()) {
        if (this.nodes.length === 1) {
          return node;
        }
      }

      return Sparse.of(this.mask, replace(this.nodes, index, node));
    }

    return this;
  }

  public map<U>(mapper: Mapper<V, U, [K]>): Sparse<K, U> {
    return Sparse.of(
      this.mask,
      this.nodes.map(node => node.map(mapper))
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Sparse &&
      value.mask === this.mask &&
      value.nodes.length === this.nodes.length &&
      value.nodes.every((node, i) => node.equals(this.nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<[K, V]> {
    for (const node of this.nodes) {
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
