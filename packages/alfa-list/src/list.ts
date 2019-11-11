import { Equality } from "@siteimprove/alfa-equality";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Branch, Empty, Leaf, Node } from "./node";

export class List<T>
  implements Monad<T>, Functor<T>, Foldable<T>, Iterable<T>, Equality<List<T>> {
  public static of<T>(...values: Array<T>): List<T> {
    return values.reduce((list, value) => list.push(value), List.empty<T>());
  }

  public static empty<T>(): List<T> {
    return new List(Empty.of(), Empty.of(), 0, 0);
  }

  private readonly head: Empty<T> | Branch<T> | Leaf<T>;
  private readonly tail: Empty<T> | Leaf<T>;
  private readonly shift: number;
  public readonly size: number;

  private constructor(
    head: Empty<T> | Branch<T> | Leaf<T>,
    tail: Leaf<T> | Empty<T>,
    shift: number,
    size: number
  ) {
    this.head = head;
    this.tail = tail;
    this.shift = shift;
    this.size = size;
  }

  public map<U>(mapper: Mapper<T, U>): List<U> {
    return new List<U>(
      this.head instanceof Empty
        ? this.head
        : this.head instanceof Branch
        ? this.head.map(mapper)
        : this.head.map(mapper),
      this.tail.map(mapper),
      this.shift,
      this.size
    );
  }

  public flatMap<U>(mapper: Mapper<T, List<U>>): List<U> {
    return this.reduce(
      (list, value) => list.concat(mapper(value)),
      List.empty<U>()
    );
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return Iterable.reduce(this, reducer, accumulator);
  }

  public concat(iterable: Iterable<T>): List<T> {
    return Iterable.reduce<T, List<T>>(
      iterable,
      (list, value) => list.push(value),
      this
    );
  }

  public includes(value: T): boolean {
    return Iterable.includes(this, value);
  }

  public find<U extends T>(predicate: Predicate<T, U>): Option<U> {
    return Iterable.find(this, predicate);
  }

  public filter<U extends T>(predicate: Predicate<T, U>): List<T> {
    return List.from(Iterable.filter(this, predicate));
  }

  public subtract(list: List<T>): List<T> {
    return List.from(Iterable.subtract(this, list));
  }

  public intersect(list: List<T>): List<T> {
    return List.from(Iterable.intersect(this, list));
  }

  public get(index: number): Option<T> {
    if (index < 0 || index >= this.size) {
      return None;
    }

    const offset = this.size - this.tail.size;

    let value: Option<T>;

    if (index < offset) {
      value = this.head.get(index, this.shift - Node.Bits);
    } else {
      value = this.tail.get(index - offset, this.shift);
    }

    return value;
  }

  public set(index: number, value: T): List<T> {
    if (index < 0 || index >= this.size) {
      return this;
    }

    const offset = this.size - this.tail.size;

    let head = this.head;
    let tail = this.tail;

    if (index < offset) {
      head = head.set(index, this.shift, value);
    } else {
      tail = tail.set(index - offset, this.shift, value);
    }

    return new List(head, tail, this.shift, this.size);
  }

  public push(value: T): List<T> {
    // If no tail exists yet, this means that the list is empty. We therefore
    // create a new tail with the pushed value. As the current list is empty,
    // it won't have a head. As such, there's no need to pass the head along.
    //
    // In:  List { head: Empty, tail: Empty }
    // Out: List { head: Empty, tail: Leaf(value) }
    //
    if (this.tail.isEmpty()) {
      return new List(Empty.of(), Leaf.of([value]), 0, 1);
    }

    // If the tail has capacity for another value, we concatenate the pushed
    // value onto the current tail. The current list may or may not have a head,
    // so we pass the head along as-is.
    //
    // In:  List { head, tail }
    // Out: List { head, tail: Leaf(...tail, value) }
    //
    if (this.tail.hasCapacity()) {
      return new List(
        this.head,
        Leaf.of([...this.tail.values, value]),
        this.shift,
        this.size + 1
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
    if (this.head.isEmpty()) {
      return new List(
        this.tail,
        Leaf.of([value]),
        this.shift + Node.Bits,
        this.size + 1
      );
    }

    const index = this.size - Node.Capacity;

    let head = this.head;
    let shift = this.shift;

    // If the head has overflown, we need to split it which in turn increases
    // the depth of the list.
    if (head instanceof Leaf || index === Node.overflow(shift)) {
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
          prev.nodes[i] = this.tail;
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
    return new List(head, Leaf.of([value]), shift, this.size + 1);
  }

  public pop(): List<T> {
    // If the list has no tail then it is empty. We therefore return the list
    // itself as the pop has no effect.
    if (this.tail.isEmpty()) {
      return this;
    }

    // If the list has a size of 1 then the result of the popping its last
    // element will be an empty list.
    //
    // In:  List { head: Empty, tail: Leaf(value) }
    // Out: List { head: Empty, tail: Empty }
    //
    if (this.size === 1) {
      return List.empty();
    }

    // If the tail has more than one element, it will have a non-zero length
    // after popping the last element. We can therefore get away with removing
    // the last element from the tail and reuse the head.
    //
    // In:  List { head, tail: Leaf(...tail, value) }
    // Out: List { head, tail }
    //
    if (this.tail.size > 1) {
      return new List(
        this.head,
        Leaf.of(this.tail.values.slice(0, this.tail.size - 1)),
        this.shift,
        this.size - 1
      );
    }

    if (this.head instanceof Leaf) {
      return new List(
        Empty.of(),
        this.head,
        this.shift - Node.Bits,
        this.size - 1
      );
    }

    let head = this.head.clone() as Empty<T> | Branch<T> | Leaf<T>;
    let tail = this.tail;
    let shift = this.shift;

    const index = this.size - Node.Capacity - 1;

    let prev = head as Branch<T>;
    let level = shift - Node.Bits;

    // We now remove the rightmost leaf of the head as this will be used as the
    // new tail.
    while (level > 0) {
      const fragment = Node.fragment(index, level);

      level -= Node.Bits;

      const next = prev.nodes[fragment];

      // Once we reach the rightmost leaf node, remove it as it will be used as
      // the new tail.
      if (next instanceof Leaf) {
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
      head = head instanceof Leaf ? Empty.of() : (head as Branch<T>).nodes[0];
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
    return new List(head, tail, shift, this.size - 1);
  }

  public equals(value: unknown): value is List<T> {
    return (
      value instanceof List &&
      value.size === this.size &&
      value.head.equals(this.head) &&
      value.tail.equals(this.tail)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* Iterable.concat(this.head, this.tail);
  }

  public toJSON() {
    return [...this];
  }
}

export namespace List {
  export function from<T>(iterable: Iterable<T>): List<T> {
    return isList<T>(iterable) ? iterable : List.of(...iterable);
  }

  export function isList<T>(value: unknown): value is List<T> {
    return value instanceof List;
  }
}
