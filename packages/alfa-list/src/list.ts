import { Equality } from "@siteimprove/alfa-equality";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Leaf, Node } from "./node";

export class List<T>
  implements Monad<T>, Functor<T>, Foldable<T>, Iterable<T>, Equality<List<T>> {
  public static of<T>(...values: Array<T>): List<T> {
    return values.reduce((list, value) => list.push(value), List.empty<T>());
  }

  public static empty<T>(): List<T> {
    return new List(null, null, 0, 0);
  }

  private readonly head: Node<T> | null;
  private readonly tail: Leaf<T> | null;
  private readonly depth: number;
  public readonly size: number;

  private constructor(
    head: Node<T> | null,
    tail: Leaf<T> | null,
    depth: number,
    size: number
  ) {
    this.head = head;
    this.tail = tail;
    this.depth = depth;
    this.size = size;
  }

  public map<U>(mapper: Mapper<T, U>): List<U> {
    if (this.tail === null) {
      return List.empty<U>();
    }

    return new List(
      this.head === null ? null : Node.map(this.head, this.depth, mapper),
      this.tail.map(mapper),
      this.depth,
      this.size
    );
  }

  public flatMap<U>(mapper: Mapper<T, List<U>>): List<U> {
    return this.reduce(
      (values, value) => values.concat(mapper(value)),
      List.empty<U>()
    );
  }

  public reduce<U>(reducer: Reducer<T, U>, accumulator: U): U {
    return Iterable.reduce(this, reducer, accumulator);
  }

  public concat(iterable: Iterable<T>): List<T> {
    return Iterable.reduce<T, List<T>>(
      iterable,
      (values, value) => values.push(value),
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

    const head = this.head!;
    const tail = this.tail!;

    const offset = this.size - tail.length;

    let value: T;

    if (index < offset) {
      let prev = head;

      for (let level = this.depth - 1; level > 0; level--) {
        const i = Node.key(index, level);
        const next = prev[i] as Node<T>;

        prev = next;
      }

      value = prev[index & Node.Mask] as T;
    } else {
      value = tail[index - offset];
    }

    return Some.of(value);
  }

  public set(index: number, value: T): List<T> {
    if (index < 0 || index >= this.size) {
      return this;
    }

    let head = this.head!;
    let tail = this.tail!;

    const offset = this.size - tail.length;

    if (index < offset) {
      head = head.slice(0);

      let prev = head;

      for (let level = this.depth - 1; level > 0; level--) {
        const i = Node.key(index, level);
        const next = prev[i] as Node<T>;

        prev = prev[i] = next.slice(0);
      }

      prev[index & Node.Mask] = value;
    } else {
      tail = tail.slice(0);
      tail[index - offset] = value;
    }

    return new List(head, tail, this.depth, this.size);
  }

  public push(value: T): List<T> {
    // If no tail exists yet, this means that the list is empty. We therefore
    // create a new tail with the pushed value. As the current list is empty,
    // it won't have a head. As such, there's no need to pass the head along.
    //
    // In:  List { head: null, tail: null }
    // Out: List { head: null, tail: [value] }
    //
    if (this.tail === null) {
      return new List(null, [value], 0, 1);
    }

    // If the tail has capacity for another value, we concatenate the pushed
    // value onto the current tail. The current list may or may not have a head,
    // so we pass the head along as-is.
    //
    // In:  List { head, tail }
    // Out: List { head, tail: [...tail, value] }
    //
    if (this.tail.length < Node.Capacity) {
      return new List(
        this.head,
        [...this.tail, value],
        this.depth,
        this.size + 1
      );
    }

    // If the tail does not have capacity for another value, we need to add it
    // to the head to make room for a new tail. If the current list does not
    // have a head, we use the current tail as the new head and create a new
    // tail with the pushed value. As a result of this, the depth of the list
    // increases by 1.
    //
    // In:  List { head: null, tail }
    // Out: List { head: tail, tail: [value] }
    //
    if (this.head === null) {
      return new List(this.tail, [value], this.depth + 1, this.size + 1);
    }

    const offset = this.size - Node.Capacity;

    let head = this.head;
    let depth = this.depth;

    // If the head has overflown, we need to split it which in turn increases
    // the depth of the list.
    if (offset === Node.overflow(depth)) {
      head = [head];
      depth += 1;
    } else {
      head = head.slice(0);
    }

    let prev = head;

    // We now add the tail to the head in order to make room for a new tail. To
    // do this, we make our way to `offset` as this is where the tail will need
    // to be inserted.
    for (let level = depth - 1; level > 0; level--) {
      const i = Node.key(offset, level);
      const next = prev[i] as Node<T> | undefined;

      // Once we reach a missing node, either insert the tail of the current
      // list if we're at the leaf or create a new branch node if we're not.
      if (next === undefined) {
        prev = prev[i] = level === 1 ? this.tail : [];
      }

      // Otherwise, copy the node and store the copy with the previous node.
      // This creates a copy of the path to the tail we're inserting.
      else {
        prev = prev[i] = next.slice(0);
      }
    }

    // With the current tail inserted into the new head, we can now make a new
    // tail with the pushed value. Do note that the spread syntax is only used
    // for illustrative purposes here; the tail is actually inserted in the
    // rightmost branch of the head.
    //
    // In:  List { head, tail }
    // Out: List { head: [...head, ...tail], tail: [value] }
    //
    return new List(head, [value], depth, this.size + 1);
  }

  public pop(): List<T> {
    // If the list has no tail then it is empty. We therefore return the list
    // itself as the pop has no effect.
    if (this.tail === null) {
      return this;
    }

    // If the list has a size of 1 then the result of the popping its last
    // element will be an empty list.
    //
    // In:  List { head: null, tail: [value] }
    // Out: List { head: null, tail: null }
    //
    if (this.size === 1) {
      return List.empty();
    }

    // If the tail has more than one element, it will have a non-zero length
    // after popping the last element. We can therefore get away with removing
    // the last element from the tail and reuse the head.
    //
    // In:  List { head, tail: [...tail, value] }
    // Out: List { head, tail }
    //
    if (this.tail.length > 1) {
      return new List(
        this.head,
        this.tail.slice(0, this.tail.length - 1),
        this.depth,
        this.size - 1
      );
    }

    let head: Node<T> | null = this.head!.slice(0);
    let depth = this.depth;

    let prev = head;

    // We now remove the rightmost leaf of the head as this will be used as the
    // new tail.
    for (let level = this.depth - 1; level > 0; level--) {
      const i = prev.length - 1;
      const next = prev[i] as Node<T>;

      // Once we reach the rightmost leaf node, remove it as it will be used as
      // the new tail.
      if (level === 1) {
        prev.pop();
        prev = next;
      }

      // Otherwise, copy the node and store the copy with the previous node.
      // This creates a copy of the path to the rightmost leaf node.
      else {
        prev = prev[i] = next.slice(0);
      }
    }

    const offset = this.size - Node.Capacity - 1;

    // If the head has underflown, we unwrap its first child and use that as the
    // new head which in turn decreases the depth of the list. If the head is a
    // leaf node, we instead set the new head to null.
    if (offset === Node.underflow(depth)) {
      head = Node.isLeaf(head, depth) ? null : head[0];
      depth -= 1;
    }

    // With the rightmost branch of the head removed, we can now use it as the
    // new tail and discard the old. Do note that the spread syntax is only used
    // for illustrative purposes here; the tail is actually removed from the
    // rightmost branch of the head.
    //
    // In:  List { head: [...head, tail]: tail: [value] }
    // Out: List { head, tail }
    //
    return new List(head, prev as Leaf<T>, this.depth, this.size - 1);
  }

  public equals(value: unknown): value is List<T> {
    return (
      value instanceof List &&
      value.size === this.size &&
      Node.equals(value.head, this.head, this.depth) &&
      Node.equals(value.tail, this.tail, 1)
    );
  }

  public *[Symbol.iterator](): Iterator<T> {
    if (this.head !== null) {
      yield* Node.iterate(this.head, this.depth);
    }

    if (this.tail !== null) {
      yield* this.tail;
    }
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
