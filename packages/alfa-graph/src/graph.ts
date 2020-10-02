import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

import * as json from "@siteimprove/alfa-json";

export class Graph<T>
  implements Iterable<[T, Iterable<T>]>, Equatable, Serializable {
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
          .get()
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
          .get()
      )
    );
  }

  public traverse(
    root: T,
    traversal: Graph.Traversal = Graph.DepthFirst
  ): Sequence<T> {
    return Sequence.from(traversal(this, root));
  }

  public hasPath(from: T, to: T): boolean {
    if (!this.has(from) || !this.has(to)) {
      return false;
    }

    return this.traverse(from).includes(to);
  }

  public equals(value: unknown): value is this {
    return value instanceof Graph && value._nodes.equals(this._nodes);
  }

  public *[Symbol.iterator](): Iterator<[T, Iterable<T>]> {
    yield* this._nodes;
  }

  public toArray(): Array<[T, Array<T>]> {
    return [...this].map(([node, neighbors]) => [node, [...neighbors]]);
  }

  public toJSON(): Graph.JSON {
    return this.toArray().map(([node, neighbors]) => [
      Serializable.toJSON(node),
      neighbors.map(Serializable.toJSON),
    ]);
  }

  public toString(): string {
    const entries = [...this._nodes]
      .map(([node, edges]) => {
        const entries = [...edges].join(", ");

        return `${node}${entries === "" ? "" : ` => [ ${entries} ]`}`;
      })
      .join(", ");

    return `Graph {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

export namespace Graph {
  export interface JSON extends Array<[json.JSON, Array<json.JSON>]> {}

  export function isGraph<T>(value: unknown): value is Graph<T> {
    return value instanceof Graph;
  }

  export function from<T>(
    iterable: Iterable<readonly [T, Iterable<T>]>
  ): Graph<T> {
    if (isGraph<T>(iterable)) {
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
    <T>(graph: Graph<T>, root: T): Iterable<T>;
  }

  /**
   * @see https://en.wikipedia.org/wiki/Depth-first_search
   */
  export const DepthFirst: Traversal = function* <T>(graph: Graph<T>, root: T) {
    const queue = [root];

    let seen = Set.empty<T>();

    while (queue.length > 0) {
      const next = queue.pop()!;

      if (seen.has(next)) {
        continue;
      }

      yield next;

      seen = seen.add(next);

      for (const neighbor of graph.neighbors(next)) {
        queue.push(neighbor);
      }
    }
  };

  /**
   * @see https://en.wikipedia.org/wiki/Breadth-first_search
   */
  export const BreadthFirst: Traversal = function* <T>(
    graph: Graph<T>,
    root: T
  ) {
    const queue = [root];

    let seen = Set.of(root);

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const neighbor of graph.neighbors(next)) {
        if (seen.has(neighbor)) {
          continue;
        }

        seen = seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  };
}
