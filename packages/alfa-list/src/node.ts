import { Bits } from "@siteimprove/alfa-bits";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";

const { bit, take, skip } = Bits;

/**
 * @internal
 */
export interface Node<T> extends Iterable<T>, Equatable {
  isEmpty(): this is Empty<T>;
  isLeaf(): this is Leaf<T>;
  get(index: number, shift: number): Option<T>;
  set(index: number, value: T, shift: number): Node<T>;
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
  private static _empty = new Empty<never>();

  public static empty<T>(): Empty<T> {
    return this._empty;
  }

  private constructor() {}

  public isEmpty(): this is Empty<T> {
    return true;
  }

  public isLeaf(): this is Leaf<T> {
    return false;
  }

  public get(): None {
    return None;
  }

  public set(): Empty<T> {
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

  private readonly _values: Array<T>;

  private constructor(values: Array<T>) {
    this._values = values;
  }

  public get values(): Array<T> {
    return this._values;
  }

  public isEmpty(): this is Empty<T> {
    return false;
  }

  public isLeaf(): this is Leaf<T> {
    return true;
  }

  public hasCapacity(): boolean {
    return this._values.length < Node.Capacity;
  }

  public get(index: number): Option<T> {
    const fragment = take(index, Node.Bits);

    return Option.of(this._values[fragment]);
  }

  public set(index: number, value: T): Leaf<T> {
    const fragment = take(index, Node.Bits);

    if (Equatable.equals(value, this._values[fragment])) {
      return this;
    }

    const values = this._values.slice(0);

    values[fragment] = value;

    return Leaf.of(values);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Leaf &&
      value._values.length === this._values.length &&
      value._values.every((value, i) =>
        Equatable.equals(value, this._values[i])
      )
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._values;
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

  private readonly _nodes: Array<Branch<T> | Leaf<T>>;

  private constructor(nodes: Array<Branch<T> | Leaf<T>>) {
    this._nodes = nodes;
  }

  public get nodes(): Array<Branch<T> | Leaf<T>> {
    return this._nodes;
  }

  public isEmpty(): this is Empty<T> {
    return false;
  }

  public isLeaf(): this is Leaf<T> {
    return false;
  }

  public clone(): Branch<T> {
    return Branch.of(this._nodes.slice(0));
  }

  public get(index: number, shift: number): Option<T> {
    const fragment = Node.fragment(index, shift);

    return this._nodes[fragment].get(index, shift - Node.Bits);
  }

  public set(index: number, value: T, shift: number): Branch<T> {
    const fragment = Node.fragment(index, shift);

    const node = this._nodes[fragment].set(index, value, shift - Node.Bits);

    if (node === this._nodes[fragment]) {
      return this;
    }

    const nodes = this._nodes.slice(0);

    nodes[fragment] = node;

    return Branch.of(nodes);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Branch &&
      value._nodes.length === this._nodes.length &&
      value._nodes.every((node, i) => node.equals(this._nodes[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const node of this._nodes) {
      yield* node;
    }
  }
}
