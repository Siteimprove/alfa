import { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import { Comparable, type Comparer, type Comparison } from "@siteimprove/alfa-comparable";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Set } from "@siteimprove/alfa-set";

import { Branch, Empty, Leaf, Node } from "./node.js";

const { not } = Predicate;
const { compareComparable } = Comparable;

/**
 * @public
 */
export class List<T> implements Collection.Indexed<T> {
  public static of<T>(...values: Array<T>): List<T> {
    const size = values.length;

    // Fast path: The values fit within the tail.
    if (size <= Node.Capacity) {
      return new List(Empty, Leaf.of(values), 0, size);
    }

    return values.reduce((list, value) => list._push(value), List.empty<T>());
  }

  private static _empty = new List<never>(Empty, Empty, 0, 0);

  public static empty<T = never>(): List<T> {
    return this._empty;
  }

  private readonly _head: Empty | Leaf<T> | Branch<T>;
  private readonly _tail: Empty | Leaf<T>;
  private readonly _shift: number;
  private readonly _size: number;

  protected constructor(
    head: Empty | Leaf<T> | Branch<T>,
    tail: Empty | Leaf<T>,
    shift: number,
    size: number,
  ) {
    this._head = head;
    this._tail = tail;
    this._shift = shift;
    this._size = size;
  }

  public get size(): number {
    return this._size;
  }

  public isEmpty(): this is List<never> {
    return this._tail.isEmpty();
  }

  public forEach(callback: Callback<T, void, [index: number]>): void {
    Iterable.forEach(this, callback);
  }

  public map<U>(mapper: Mapper<T, U, [index: number]>): List<U> {
    let index = 0;

    const tail = (this._tail as Node<T>).map((value) => mapper(value, index++));

    const head = (this._head as Node<T>).map((value) => mapper(value, index++));

    return new List(
      head as Empty | Leaf<U> | Branch<U>,
      tail as Empty | Leaf<U>,
      this._shift,
      this._size,
    );
  }

  public apply<U>(mapper: List<Mapper<T, U>>): List<U> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatMap<U>(mapper: Mapper<T, List<U>, [index: number]>): List<U> {
    return this.reduce(
      (list, value, index) => list.concat(mapper(value, index)),
      List.empty<U>(),
    );
  }

  public flatten<T>(this: List<List<T>>): List<T> {
    return this.flatMap((list) => list);
  }

  public reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U {
    return Iterable.reduce(this, reducer, accumulator);
  }

  public reduceWhile<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    return Iterable.reduceWhile(this, predicate, reducer, accumulator);
  }

  public reduceUntil<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    return Iterable.reduceUntil(this, predicate, reducer, accumulator);
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): List<U>;

  public filter(predicate: Predicate<T, [index: number]>): List<T>;

  public filter(predicate: Predicate<T, [index: number]>): List<T> {
    return List.from(Iterable.filter(this, predicate));
  }

  public reject<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): List<Exclude<T, U>>;

  public reject(predicate: Predicate<T, [index: number]>): List<T>;

  public reject(predicate: Predicate<T, [index: number]>): List<T> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Option<U>;

  public find(predicate: Predicate<T, [index: number]>): Option<T>;

  public find(predicate: Predicate<T, [index: number]>): Option<T> {
    return Iterable.find(this, predicate);
  }

  public includes(value: T): boolean {
    return Iterable.includes(this, value);
  }

  public collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): List<U> {
    return List.from(Iterable.collect(this, mapper));
  }

  public collectFirst<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
  ): Option<U> {
    return Iterable.collectFirst(this, mapper);
  }

  public some(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.some(this, predicate);
  }

  public none(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.none(this, predicate);
  }

  public every(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.every(this, predicate);
  }

  public count(predicate: Predicate<T, [index: number]>): number {
    return Iterable.count(this, predicate);
  }

  public distinct(): List<T> {
    let seen = Set.empty<T>();
    let list = List.empty<T>();

    for (const value of this) {
      if (seen.has(value)) {
        continue;
      }

      seen = seen.add(value);
      list = list.append(value);
    }

    return list;
  }

  public get(index: number): Option<T> {
    if (index < 0 || index >= this._size || this._tail.isEmpty()) {
      return None;
    }

    const offset = this._size - this._tail.values.length;

    let value: Option<T>;

    if (index < offset) {
      value = this._head.get(index, this._shift - Node.Bits);
    } else {
      value = this._tail.get(index - offset);
    }

    return value;
  }

  public has(index: number): boolean {
    return index >= 0 && index < this._size;
  }

  public set(index: number, value: T): List<T> {
    if (index < 0 || index >= this._size || this._tail.isEmpty()) {
      return this;
    }

    const offset = this._size - this._tail.values.length;

    let head = this._head;
    let tail = this._tail;

    if (index < offset) {
      if (head.isEmpty()) {
        return this;
      }

      head = head.set(index, value, this._shift);

      if (head === this._head) {
        return this;
      }
    } else {
      tail = tail.set(index - offset, value);

      if (tail === this._tail) {
        return this;
      }
    }

    return new List(head, tail, this._shift, this._size);
  }

  public insert(index: number, value: T): List<T> {
    if (index < 0 || index > this.size) {
      return this;
    }

    if (index === 0) {
      return this.prepend(value);
    }

    if (index === this.size) {
      return this.append(value);
    }

    return List.from(
      Iterable.concat(
        Iterable.take(this, index),
        Iterable.from([value]),
        Iterable.skip(this, index),
      ),
    );
  }

  public append(value: T): List<T> {
    return this._push(value);
  }

  public prepend(value: T): List<T> {
    return List.of(value).concat(this);
  }

  public concat(iterable: Iterable<T>): List<T> {
    return Iterable.reduce<T, List<T>>(
      iterable,
      (list, value) => list._push(value),
      this,
    );
  }

  public subtract(iterable: Iterable<T>): List<T> {
    return List.from(Iterable.subtract(this, iterable));
  }

  public intersect(iterable: Iterable<T>): List<T> {
    return List.from(Iterable.intersect(this, iterable));
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<this, void, [...args: A]>,
    ...args: A
  ): this {
    callback(this, ...args);
    return this;
  }

  public zip<U>(iterable: Iterable<U>): List<[T, U]> {
    return List.from(Iterable.zip(this, iterable));
  }

  public first(): Option<T> {
    return this._tail.isEmpty() ? None : Option.of(this._tail.values[0]);
  }

  public last(): Option<T> {
    return Iterable.last(this);
  }

  public take(count: number): List<T> {
    return List.from(Iterable.take(this, count));
  }

  public takeWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): List<U>;

  public takeWhile(predicate: Predicate<T, [index: number]>): List<T>;

  public takeWhile(predicate: Predicate<T, [index: number]>): List<T> {
    return List.from(Iterable.takeWhile(this, predicate));
  }

  public takeUntil(predicate: Predicate<T, [index: number]>): List<T> {
    return this.takeWhile(not(predicate));
  }

  public takeLast(count: number = 1): List<T> {
    return List.from(Iterable.takeLast(this, count));
  }

  public takeLastWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): List<U>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): List<T>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): List<T> {
    return List.from(Iterable.takeLastWhile(this, predicate));
  }

  public takeLastUntil(predicate: Predicate<T, [index: number]>): List<T> {
    return this.takeLastWhile(not(predicate));
  }

  public skip(count: number): List<T> {
    return List.from(Iterable.skip(this, count));
  }

  public skipWhile(predicate: Predicate<T, [index: number]>): List<T> {
    return List.from(Iterable.skipWhile(this, predicate));
  }

  public skipUntil(predicate: Predicate<T, [index: number]>): List<T> {
    return this.skipWhile(not(predicate));
  }

  public skipLast(count: number = 1): List<T> {
    let list: List<T> = this;

    while (count-- > 0) {
      list = list._pop();
    }

    return list;
  }

  public skipLastWhile(predicate: Predicate<T, [index: number]>): List<T> {
    return List.from(Iterable.skipLastWhile(this, predicate));
  }

  public skipLastUntil(predicate: Predicate<T, [index: number]>): List<T> {
    return this.skipLastWhile(not(predicate));
  }

  public trim(predicate: Predicate<T, [index: number]>): List<T> {
    return this.trimLeading(predicate).trimTrailing(predicate);
  }

  public trimLeading(predicate: Predicate<T, [index: number]>): List<T> {
    return this.skipWhile(predicate);
  }

  public trimTrailing(predicate: Predicate<T, [index: number]>): List<T> {
    return this.skipLastWhile(predicate);
  }

  public rest(): List<T> {
    return this.skip(1);
  }

  public slice(start: number, end?: number): List<T> {
    return List.from(Iterable.slice(this, start, end));
  }

  public reverse(): List<T> {
    return List.from(Iterable.reverse(this));
  }

  public join(separator: string): string {
    return Iterable.join(this, separator);
  }

  public sort<T extends Comparable<T>>(this: List<T>): List<T> {
    return this.sortWith(compareComparable);
  }

  public sortWith(comparer: Comparer<T>): List<T>;

  public sortWith<T, U extends T = T>(
    this: List<U>,
    comparer: Comparer<T>,
  ): List<U>;

  public sortWith(comparer: Comparer<T>): List<T> {
    return List.from(Iterable.sortWith(this, comparer));
  }

  public compare<T>(
    this: List<Comparable<T>>,
    iterable: Iterable<T>,
  ): Comparison {
    return this.compareWith(iterable, compareComparable);
  }

  public compareWith<U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>,
  ): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public groupBy<K>(grouper: Mapper<T, K>): Map<K, List<T>> {
    return this.reduce((groups, value) => {
      const group = grouper(value);

      return groups.set(
        group,
        groups
          .get(group)
          .getOrElse(() => List.empty<T>())
          ._push(value),
      );
    }, Map.empty<K, List<T>>());
  }

  public equals<T>(value: List<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof List &&
      value._size === this._size &&
      value._head.equals(this._head) &&
      value._tail.equals(this._tail)
    );
  }

  public hash(hash: Hash): void {
    for (const value of this) {
      hash.writeUnknown(value);
    }

    hash.writeUint32(this._size);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._head;
    yield* this._tail;
  }

  public toArray(): Array<T> {
    return [...this];
  }

  public toJSON(options?: Serializable.Options): List.JSON<T> {
    return this.toArray().map((value) => Serializable.toJSON(value, options));
  }

  public toString(): string {
    const values = this.join(", ");

    return `List [${values === "" ? "" : ` ${values} `}]`;
  }

  private _push(value: T): List<T> {
    // If no tail exists yet, this means that the list is empty. We therefore
    // create a new tail with the pushed value. As the current list is empty,
    // it won't have a head. As such, there's no need to pass the head along.
    //
    // In:  List { head: Empty, tail: Empty }
    // Out: List { head: Empty, tail: Leaf(value) }
    //
    if (this._tail.isEmpty()) {
      return new List(Empty, Leaf.of([value]), 0, 1);
    }

    // If the tail has capacity for another value, we concatenate the pushed
    // value onto the current tail. The current list may or may not have a head,
    // so we pass the head along as-is.
    //
    // In:  List { head, tail }
    // Out: List { head, tail: Leaf(...tail, value) }
    //
    if (this._tail.hasCapacity()) {
      return new List(
        this._head,
        Leaf.of([...this._tail.values, value]),
        this._shift,
        this._size + 1,
      );
    }

    // If the tail does not have capacity for another value, we need to add it
    // to the head to make room for a new tail. If the current list does not
    // have a head, we use the current tail as the new head and create a new
    // tail with the pushed value.
    //
    // In:  List { head: Empty, tail }
    // Out: List { head: tail, tail: Leaf(value) }
    //
    if (this._head.isEmpty()) {
      return new List(
        this._tail,
        Leaf.of([value]),
        this._shift + Node.Bits,
        this._size + 1,
      );
    }

    const index = this._size - Node.Capacity;

    let head = this._head;
    let shift = this._shift;

    // If the head has overflown, we need to split it which in turn increases
    // the depth of the list.
    if (head.isLeaf() || index === Node.overflow(shift)) {
      head = Branch.of([head]);
      shift += Node.Bits;
    } else {
      head = head.clone();
    }

    let prev = head;
    let level = shift - Node.Bits;

    // We now add the tail to the head in order to make room for a new tail.
    while (level > 0) {
      const i = Node.fragment(index, level);

      level -= Node.Bits;

      const next = prev.nodes[i] as Branch<T> | undefined;

      if (next === undefined) {
        if (level === 0) {
          prev.nodes[i] = this._tail;
        } else {
          prev.nodes[i] = prev = Branch.empty<T>();
        }
      } else {
        prev.nodes[i] = prev = next.clone();
      }
    }

    // With the current tail inserted into the new head, we can now make a new
    // tail with the pushed value. Do note that the spread syntax is only used
    // for illustrative purposes here; the tail is actually inserted in the
    // rightmost branch of the head.
    //
    // In:  List { head, tail }
    // Out: List { head: Branch(...head, ...tail), tail: Leaf(value) }
    //
    return new List(head, Leaf.of([value]), shift, this._size + 1);
  }

  private _pop(): List<T> {
    // If the list has no tail then it is empty. We therefore return the list
    // itself as the pop has no effect.
    if (this._tail.isEmpty()) {
      return this;
    }

    // If the list has a size of 1 then the result of the popping its last
    // element will be an empty list.
    //
    // In:  List { head: Empty, tail: Leaf(value) }
    // Out: List { head: Empty, tail: Empty }
    //
    if (this._size === 1) {
      return List.empty();
    }

    // If the tail has more than one element, it will have a non-zero size after
    // popping the last element. We can therefore get away with removing the
    // last element from the tail and reuse the head.
    //
    // In:  List { head, tail: Leaf(...tail, value) }
    // Out: List { head, tail }
    //
    if (this._tail.values.length > 1) {
      return new List(
        this._head,
        Leaf.of(this._tail.values.slice(0, this._tail.values.length - 1)),
        this._shift,
        this._size - 1,
      );
    }

    if (this._head.isLeaf() || this._head.isEmpty()) {
      return new List(
        Empty,
        this._head,
        this._shift - Node.Bits,
        this._size - 1,
      );
    }

    let head: Leaf<T> | Branch<T> = this._head.clone();
    let tail = this._tail;
    let shift = this._shift;

    const index = this._size - Node.Capacity - 1;

    let prev = head;
    let level = shift - Node.Bits;

    // We now remove the rightmost leaf of the head as this will be used as the
    // new tail.
    while (level > 0) {
      const fragment = Node.fragment(index, level);

      level -= Node.Bits;

      const next = prev.nodes[fragment];

      // Once we reach the rightmost leaf node, remove it as it will be used as
      // the new tail.
      if (next.isLeaf()) {
        prev.nodes.pop();
        tail = next;
      } else {
        prev = prev.nodes[fragment] = next.clone();
      }
    }

    // If the head has underflown, we unwrap its first child and use that as the
    // new head which in turn decreases the depth of the list. If the head is a
    // leaf node, we instead set the new head to null.
    if (index === Node.underflow(shift)) {
      head = head.nodes[0];
      shift -= Node.Bits;
    }

    // With the rightmost branch of the head removed, we can now use it as the
    // new tail and discard the old. Do note that the spread syntax is only used
    // for illustrative purposes here; the tail is actually removed from the
    // rightmost branch of the head.
    //
    // In:  List { head: Branch(...head, tail), tail: Leaf(value) }
    // Out: List { head, tail }
    //
    return new List(head, tail, shift, this._size - 1);
  }
}

/**
 * @public
 */
export namespace List {
  export type JSON<T> = Collection.Indexed.JSON<T>;

  export function isList<T>(value: Iterable<T>): value is List<T>;

  export function isList<T>(value: unknown): value is List<T>;

  export function isList<T>(value: unknown): value is List<T> {
    return value instanceof List;
  }

  export function from<T>(iterable: Iterable<T>): List<T> {
    if (isList(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromArray<T>(array: ReadonlyArray<T>): List<T> {
    const size = array.length;

    // Fast path: The array fits within the tail.
    if (size <= Node.Capacity) {
      return List.of(...array);
    }

    return Array.reduce(
      array,
      (list, value) => list.append(value),
      List.empty(),
    );
  }

  export function fromIterable<T>(iterable: Iterable<T>): List<T> {
    return Iterable.reduce(
      iterable,
      (list, value) => list.append(value),
      List.empty(),
    );
  }
}
