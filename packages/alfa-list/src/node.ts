import { Bits } from "@siteimprove/alfa-bits";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

const { bit, take, skip } = Bits;

/**
 * @internal
 */
export interface Node<T> extends Functor<T>, Iterable<T>, Equatable {
  readonly size: number;
  isEmpty(): this is Empty<T>;
  clone(): Node<T>;
  get(index: number, shift: number): Option<T>;
  set(index: number, shift: number, value: T): Node<T>;
  map<U>(mapper: Mapper<T, U>): Node<U>;
}

/**
 * @internal
 */
export namespace Node {
  export const Bits = 5;

  export const Capacity = bit(Bits);

  export function fragment(index: number, shift: number): number {
    return take(skip(index, shift), Bits);
  }

  export function overflow(shift: number): number {
    return Capacity << (shift - Bits);
  }

  export function underflow(shift: number): number {
    return Capacity << (shift - Bits * 2);
  }
}

/**
 * @internal
 */
export class Empty<T> implements Node<T> {
  public static of<T>(): Empty<T> {
    return new Empty();
  }

  private constructor() {}

  public get size(): number {
    return 0;
  }

  public isEmpty(): this is Empty<T> {
    return true;
  }

  public clone(): this {
    return this;
  }

  public get(): None {
    return None;
  }

  public set(): this {
    return this;
  }

  public map(): this {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Empty;
  }

  public *[Symbol.iterator](): Iterator<never> {}
}

/**
 * @internal
 */
export class Leaf<T> implements Node<T> {
  public static of<T>(values: Array<T>): Leaf<T> {
    return new Leaf(values);
  }

  public readonly values: Array<T>;

  private constructor(values: Array<T>) {
    this.values = values;
  }

  public get size(): number {
    return this.values.length;
  }

  public isEmpty(): this is Empty<T> {
    return false;
  }

  public clone(): Leaf<T> {
    return Leaf.of(this.values.slice(0));
  }

  public hasCapacity(): boolean {
    return this.values.length < Node.Capacity;
  }

  public get(index: number, shift: number): Option<T> {
    return Option.of(this.values[take(index, Node.Bits)]);
  }

  public set(index: number, shift: number, value: T): Leaf<T> {
    const values = this.values.slice(0);

    values[take(index, Node.Bits)] = value;

    return Leaf.of(values);
  }

  public map<U>(mapper: Mapper<T, U>): Leaf<U> {
    return Leaf.of(this.values.map(mapper));
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Leaf &&
      value.values.length === this.values.length &&
      value.values.every((value, i) => Equatable.equals(value, this.values[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this.values;
  }
}

/**
 * @internal
 */
export class Branch<T> implements Node<T> {
  public static of<T>(nodes: Array<Branch<T> | Leaf<T>>): Branch<T> {
    return new Branch(nodes);
  }

  public static empty<T>(): Branch<T> {
    return new Branch([]);
  }

  public readonly nodes: Array<Branch<T> | Leaf<T>>;

  private constructor(nodes: Array<Branch<T> | Leaf<T>>) {
    this.nodes = nodes;
  }

  public get size(): number {
    return this.nodes.length;
  }

  public isEmpty(): this is Empty<T> {
    return false;
  }

  public clone(): Branch<T> {
    return Branch.of(this.nodes.slice(0));
  }

  public get(index: number, shift: number): Option<T> {
    const fragment = Node.fragment(index, shift);

    return this.nodes[fragment].get(index, shift - Node.Bits);
  }

  public set(index: number, shift: number, value: T): Branch<T> {
    const fragment = Node.fragment(index, shift);

    const nodes = this.nodes.slice(0);

    nodes[fragment] = this.nodes[fragment].set(index, shift - Node.Bits, value);

    return Branch.of(nodes);
  }

  public map<U>(mapper: Mapper<T, U>): Branch<U> {
    return Branch.of(
      this.nodes.map(node =>
        node instanceof Branch ? node.map(mapper) : node.map(mapper)
      )
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Branch &&
      value.nodes.length === this.nodes.length &&
      value.nodes.every((node, i) => node.equals(this.nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const node of this.nodes) {
      yield* node;
    }
  }
}
