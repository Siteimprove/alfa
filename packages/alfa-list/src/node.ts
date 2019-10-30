import { Equality } from "@siteimprove/alfa-equality";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @internal
 */
export interface Leaf<T> extends Array<T> {}

/**
 * @internal
 */
export interface Branch<T> extends Array<Node<T>> {}

/**
 * @internal
 */
export type Node<T> = Leaf<T> | Branch<T>;

/**
 * @internal
 */
export namespace Node {
  export const Bits = 5;

  export const Capacity = 1 << Bits;

  export const Mask = Capacity - 1;

  export function isBranch<T>(
    value: T | Node<T>,
    depth: number
  ): value is Branch<T> {
    return depth > 1;
  }

  export function isLeaf<T>(
    value: T | Node<T>,
    depth: number
  ): value is Leaf<T> {
    return depth === 1;
  }

  export function isNode<T>(
    value: T | Node<T>,
    depth: number
  ): value is Node<T> {
    return depth > 0;
  }

  export function key(index: number, depth: number): number {
    return (index >>> (depth * Node.Bits)) & Node.Mask;
  }

  export function overflow(depth: number): number {
    return Node.Capacity << ((depth - 1) * Node.Bits);
  }

  export function underflow(depth: number): number {
    return Node.Capacity << ((depth - 2) * Node.Bits);
  }

  export function map<T, U>(
    node: Node<T>,
    depth: number,
    mapper: Mapper<T, U>
  ): Node<U> {
    return isLeaf(node, depth)
      ? node.map(mapper)
      : node.map(node => map(node, depth - 1, mapper));
  }

  export function* iterate<T>(node: Node<T>, depth: number): Iterable<T> {
    if (isLeaf(node, depth)) {
      yield* node;
    } else {
      yield* Iterable.flatMap(node, node => iterate(node, depth - 1));
    }
  }

  export function equals<T>(
    a: Node<T> | null,
    b: Node<T> | null,
    depth: number
  ): boolean {
    if (a === null) {
      return b === null;
    } else if (b === null) {
      return false;
    }

    if (isLeaf(a, depth) && isLeaf(b, depth)) {
      return a.every((a, i) => Equality.equals(a, b[i]));
    }

    if (isBranch(a, depth) && isBranch(b, depth)) {
      return a.every((a, i) => Node.equals(a, b[i], depth - 1));
    }

    return false;
  }
}
