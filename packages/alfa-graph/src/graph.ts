import { Equatable } from "@siteimprove/alfa-equatable";
import { Hashable, Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

/**
 * @public
 */
export class Graph<T>
  implements
    Iterable<[T, Iterable<T>]>,
    Equatable,
    Hashable,
    Serializable<Graph.JSON<T>>
{
  public static of<T>(nodes: Map<T, Set<T>>): Graph<T> {
    return new Graph(nodes);
  }

  private static _empty = new Graph<never>(Map.empty());

  public static empty<T>(): Graph<T> {
    return this._empty;
  }

  private readonly _nodes: Map<T, Set<T>>;

  private constructor(nodes: Map<T, Set<T>>) {
    this._nodes = nodes;
  }

  public get size(): number {
    return this._nodes.size;
  }

  public isEmpty(): this is Graph<never> {
    return this._nodes.isEmpty();
  }

  public nodes(): Iterable<T> {
    return this._nodes.keys();
  }

  public neighbors(node: T): Iterable<T> {
    return this._nodes.get(node).getOr([]);
  }

  public has(node: T): boolean {
    return this._nodes.has(node);
  }

  public add(node: T): Graph<T> {
    if (this.has(node)) {
      return this;
    }

    return new Graph(this._nodes.set(node, Set.empty()));
  }

  public delete(node: T): Graph<T> {
    let nodes = this._nodes;

    if (!nodes.has(node)) {
      return this;
    }

    return new Graph(
      nodes.delete(node).map((neighbors) => neighbors.delete(node))
    );
  }

  public connect(from: T, to: T): Graph<T> {
    let nodes = this._nodes;

    if (!nodes.has(from)) {
      nodes = nodes.set(from, Set.empty());
    }

    if (!nodes.has(to)) {
      nodes = nodes.set(to, Set.empty());
    }

    return new Graph(
      nodes.set(
        from,
        nodes
          .get(from)
          .map((from) => from.add(to))
          // Presence of from is guaranteed by first test.
          .getUnsafe()
      )
    );
  }

  public disconnect(from: T, to: T): Graph<T> {
    if (!this.has(from) || !this.has(to)) {
      return this;
    }

    const nodes = this._nodes;

    return new Graph(
      nodes.set(
        from,
        nodes
          .get(from)
          .map((from) => from.delete(to))
          // presence of from is guaranteed by first test.
          .getUnsafe()
      )
    );
  }

  public traverse(
    root: T,
    traversal: Graph.Traversal = Graph.DepthFirst
  ): Sequence<[node: T, parent: T]> {
    return Sequence.from(traversal(this, root));
  }

  public path(
    from: T,
    to: T,
    traversal: Graph.Traversal = Graph.BreadthFirst
  ): Sequence<T> {
    const parents = Map.from(traversal(this, from));

    const path: Array<T> = [];

    while (parents.has(to)) {
      const parent = parents
        .get(to)
        // presence of to is guaranteed by the loop condition
        .getUnsafe();

      path.unshift(to);
      to = parent;
    }

    return Sequence.from(path);
  }

  public hasPath(from: T, to: T): boolean {
    if (!this.has(from) || !this.has(to)) {
      return false;
    }

    return this.traverse(from)
      .map(([node]) => node)
      .includes(to);
  }

  public reverse(): Graph<T> {
    let reversed = Graph.empty<T>();

    for (const [node, neighbors] of this._nodes) {
      reversed = reversed.add(node);

      for (const neighbor of neighbors) {
        reversed = reversed.connect(neighbor, node);
      }
    }

    return reversed;
  }

  public *sort(): Iterable<T> {
    let incoming = this.reverse();

    const queue = incoming
      .toArray()
      .filter(([, edges]) => edges.length === 0)
      .map(([node]) => node);

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const neighbor of this.neighbors(next)) {
        incoming = incoming.disconnect(neighbor, next);

        if (Iterable.isEmpty(incoming.neighbors(neighbor))) {
          queue.push(neighbor);
        }
      }
    }
  }

  public equals<T>(value: Graph<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Graph && value._nodes.equals(this._nodes);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._nodes);
  }

  public *iterator(): Iterator<[T, Iterable<T>]> {
    yield* this._nodes;
  }

  public [Symbol.iterator](): Iterator<[T, Iterable<T>]> {
    return this.iterator();
  }

  public toArray(): Array<[T, Array<T>]> {
    return [...this].map(([node, neighbors]) => [node, [...neighbors]]);
  }

  public toJSON(): Graph.JSON<T> {
    return this.toArray().map(([node, neighbors]) => [
      Serializable.toJSON(node),
      neighbors.map((node) => Serializable.toJSON(node)),
    ]);
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([node, edges]) => {
        const entries = edges.join(", ");

        return `${node}${entries === "" ? "" : ` => [ ${entries} ]`}`;
      })
      .join(", ");

    return `Graph {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

/**
 * @public
 */
export namespace Graph {
  export type JSON<T> = Array<
    [Serializable.ToJSON<T>, Array<Serializable.ToJSON<T>>]
  >;

  export function isGraph<T>(
    value: Iterable<readonly [T, Iterable<T>]>
  ): value is Graph<T>;

  export function isGraph<T>(value: unknown): value is Graph<T>;

  export function isGraph<T>(value: unknown): value is Graph<T> {
    return value instanceof Graph;
  }

  export function from<T>(
    iterable: Iterable<readonly [T, Iterable<T>]>
  ): Graph<T> {
    if (isGraph(iterable)) {
      return iterable;
    }

    return Graph.of(
      Map.from(
        Iterable.map(iterable, ([node, neighbours]) => [
          node,
          Set.from(neighbours),
        ])
      )
    );
  }

  export interface Traversal {
    <T>(graph: Graph<T>, root: T): Iterable<[node: T, parent: T]>;
  }

  /**
   * {@link https://en.wikipedia.org/wiki/Depth-first_search}
   */
  export const DepthFirst: Traversal = function* <T>(graph: Graph<T>, root: T) {
    const stack: Array<[node: T, parent: T]> = [...graph.neighbors(root)].map(
      (node) => [node, root]
    );

    let seen = Set.of(root);

    while (stack.length > 0) {
      const next = stack.pop()!;

      if (seen.has(next[0])) {
        continue;
      }

      yield next;

      seen = seen.add(next[0]);

      for (const neighbor of graph.neighbors(next[0])) {
        stack.push([neighbor, next[0]]);
      }
    }
  };

  /**
   * {@link https://en.wikipedia.org/wiki/Breadth-first_search}
   */
  export const BreadthFirst: Traversal = function* <T>(
    graph: Graph<T>,
    root: T
  ) {
    const queue: Array<[node: T, parent: T]> = [...graph.neighbors(root)].map(
      (node) => [node, root]
    );

    let seen = Set.of(root, ...graph.neighbors(root));

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const neighbor of graph.neighbors(next[0])) {
        if (seen.has(neighbor)) {
          continue;
        }

        seen = seen.add(neighbor);
        queue.push([neighbor, next[0]]);
      }
    }
  };
}
