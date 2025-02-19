import type { Equatable } from "@siteimprove/alfa-equatable";
import { Graph } from "@siteimprove/alfa-graph";
import type { Hashable, Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

/**
 * @public
 */
export class Network<N, E>
  implements
    Iterable<[N, Iterable<[N, Iterable<E>]>]>,
    Equatable,
    Hashable,
    Serializable<Network.JSON<N, E>>
{
  public static of<N, E>(nodes: Map<N, Map<N, Set<E>>>): Network<N, E> {
    return new Network(nodes);
  }

  private static _empty = new Network<never, never>(Map.empty());

  public static empty<N, E>(): Network<N, E> {
    return this._empty;
  }

  private readonly _nodes: Map<N, Map<N, Set<E>>>;

  protected constructor(nodes: Map<N, Map<N, Set<E>>>) {
    this._nodes = nodes;
  }

  public get size(): number {
    return this._nodes.size;
  }

  public isEmpty(): this is Network<N, never> {
    return this._nodes.isEmpty();
  }

  public nodes(): Iterable<N> {
    return this._nodes.keys();
  }

  public neighbors(node: N): Iterable<[N, Iterable<E>]> {
    return this._nodes.get(node).getOr([]);
  }

  public edges(from: N, to: N): Iterable<E> {
    return this._nodes
      .get(from)
      .flatMap((neighbors) => neighbors.get(to))
      .getOr([]);
  }

  public has(node: N): boolean {
    return this._nodes.has(node);
  }

  public add(node: N): Network<N, E> {
    if (this.has(node)) {
      return this;
    }

    return new Network(this._nodes.set(node, Map.empty()));
  }

  public delete(node: N): Network<N, E> {
    const nodes = this._nodes;

    if (!nodes.has(node)) {
      return this;
    }

    return new Network(
      nodes.delete(node).map((neighbors) => neighbors.delete(node)),
    );
  }

  public connect(from: N, to: N, ...edges: Array<E>): Network<N, E> {
    if (edges.length === 0) {
      return this;
    }

    let nodes = this._nodes;

    if (!nodes.has(from)) {
      nodes = nodes.set(from, Map.empty());
    }

    if (!nodes.has(to)) {
      nodes = nodes.set(to, Map.empty());
    }

    return new Network(
      nodes.set(
        from,
        nodes
          .get(from)
          .map((from) =>
            from.set(
              to,
              from
                .get(to)
                .map((existing) =>
                  edges.reduce((edges, edge) => edges.add(edge), existing),
                )
                .getOrElse(() => Set.from(edges)),
            ),
          )
          // The presence of from is guaranteed by the second test.
          .getUnsafe(),
      ),
    );
  }

  public disconnect(from: N, to: N, ...edges: Array<E>): Network<N, E> {
    if (!this.has(from) || !this.has(to)) {
      return this;
    }

    const nodes = this._nodes;

    return new Network(
      nodes.set(
        from,
        nodes
          .get(from)
          .map((from) => {
            if (edges.length === 0) {
              return from.delete(to);
            }

            for (let existing of from.get(to)) {
              existing = edges.reduce(
                (edges, edge) => edges.delete(edge),
                existing,
              );

              if (existing.size === 0) {
                return from.delete(to);
              }

              return from.set(to, existing);
            }

            return from;
          })
          // The presence of from is guaranteed by the initial test.
          .getUnsafe(),
      ),
    );
  }

  public traverse(
    root: N,
    traversal: Network.Traversal = Network.DepthFirst,
  ): Sequence<[node: N, edges: Iterable<E>, parent: N]> {
    return Sequence.from(traversal(this, root));
  }

  public path(
    from: N,
    to: N,
    traversal: Network.Traversal = Network.BreadthFirst,
  ): Sequence<[node: N, edges: Iterable<E>]> {
    const parents = Map.from(
      Iterable.map(traversal(this, from), ([node, edges, parent]) => [
        node,
        [edges, parent] as const,
      ]),
    );

    const path: Array<[N, Iterable<E>]> = [];

    while (parents.has(to)) {
      // The presence of to is guaranteed by the loop condition.
      const [edges, parent] = parents.get(to).getUnsafe();

      path.unshift([to, edges]);
      to = parent;
    }

    return Sequence.from(path);
  }

  public hasPath(from: N, to: N): boolean {
    if (!this.has(from) || !this.has(to)) {
      return false;
    }

    return this.traverse(from)
      .map(([node]) => node)
      .includes(to);
  }

  public reverse(): Network<N, E> {
    let reversed = Network.empty<N, E>();

    for (const [node, neighbors] of this._nodes) {
      reversed = reversed.add(node);

      for (const [neighbor, edges] of neighbors) {
        reversed = reversed.connect(neighbor, node, ...edges);
      }
    }

    return reversed;
  }

  public *sort(): Iterable<N> {
    let incoming = this.reverse();

    const queue = incoming
      .toArray()
      .filter(([, edges]) => edges.length === 0)
      .map(([node]) => node);

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const [neighbor] of this.neighbors(next)) {
        incoming = incoming.disconnect(neighbor, next);

        if (Iterable.isEmpty(incoming.neighbors(neighbor))) {
          queue.push(neighbor);
        }
      }
    }
  }

  public equals<N, E>(value: Network<N, E>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Network && value._nodes.equals(this._nodes);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._nodes);
  }

  public *iterator(): Iterator<[N, Iterable<[N, Iterable<E>]>]> {
    yield* this._nodes;
  }

  public [Symbol.iterator](): Iterator<[N, Iterable<[N, Iterable<E>]>]> {
    return this.iterator();
  }

  public toArray(): Array<[N, Array<[N, Array<E>]>]> {
    return [...this].map(([node, neighbors]) => [
      node,
      [...neighbors].map(([node, edges]) => [node, [...edges]]),
    ]);
  }

  public toGraph(): Graph<N> {
    return Graph.from(
      Iterable.map(this, ([node, neighbors]) => [
        node,
        Iterable.map(neighbors, ([node]) => node),
      ]),
    );
  }

  public toJSON(): Network.JSON<N, E> {
    return this.toArray().map(([node, neighbors]) => [
      Serializable.toJSON(node),
      neighbors.map(([node, edges]) => [
        Serializable.toJSON(node),
        edges.map((edge) => Serializable.toJSON(edge)),
      ]),
    ]);
  }

  public toString(): string {
    const entries = this.toArray()
      .map(([node, neighbors]) => {
        const entries = neighbors
          .map(([node, edges]) => {
            const entries = edges.join(", ");

            return `${node}${entries === "" ? "" : ` (${entries})`}`;
          })
          .join(", ");

        return `${node}${entries === "" ? "" : ` => [ ${entries} ]`}`;
      })
      .join(", ");

    return `Network {${entries === "" ? "" : ` ${entries} `}}`;
  }
}

/**
 * @public
 */
export namespace Network {
  export type JSON<N, E> = Array<
    [
      Serializable.ToJSON<N>,
      Array<[Serializable.ToJSON<N>, Array<Serializable.ToJSON<E>>]>,
    ]
  >;

  export function isNetwork<N, E>(
    value: Iterable<readonly [N, Iterable<readonly [N, Iterable<E>]>]>,
  ): value is Network<N, E>;

  export function isNetwork<N, E>(value: unknown): value is Network<N, E>;

  export function isNetwork<N, E>(value: unknown): value is Network<N, E> {
    return value instanceof Network;
  }

  export function from<N, E>(
    iterable: Iterable<readonly [N, Iterable<readonly [N, Iterable<E>]>]>,
  ): Network<N, E> {
    if (isNetwork(iterable)) {
      return iterable;
    }

    return Network.of(
      Map.from(
        Iterable.map(iterable, ([node, neighbors]) => [
          node,
          Map.from(
            Iterable.flatMap(neighbors, function* ([node, edges]) {
              const set = Set.from(edges);

              if (set.size > 0) {
                yield [node, set];
              }
            }),
          ),
        ]),
      ),
    );
  }

  export interface Traversal {
    <N, E>(
      network: Network<N, E>,
      root: N,
    ): Iterable<[node: N, edges: Iterable<E>, parent: N]>;
  }

  /**
   * {@link https://en.wikipedia.org/wiki/Depth-first_search}
   */
  export const DepthFirst: Traversal = function* <N, E>(
    graph: Network<N, E>,
    root: N,
  ) {
    const stack: Array<[node: N, edges: Iterable<E>, parent: N]> = [
      ...graph.neighbors(root),
    ].map((node) => [...node, root]);

    let seen = Set.of(root);

    while (stack.length > 0) {
      const next = stack.pop()!;

      if (seen.has(next[0])) {
        continue;
      }

      yield next;

      seen = seen.add(next[0]);

      for (const neighbor of graph.neighbors(next[0])) {
        stack.push([...neighbor, next[0]]);
      }
    }
  };

  /**
   * {@link https://en.wikipedia.org/wiki/Breadth-first_search}
   */
  export const BreadthFirst: Traversal = function* <N, E>(
    graph: Network<N, E>,
    root: N,
  ) {
    const queue: Array<[node: N, edges: Iterable<E>, parent: N]> = [
      ...graph.neighbors(root),
    ].map((node) => [...node, root]);

    let seen = Set.of(
      root,
      ...[...graph.neighbors(root)].map(([node]) => node),
    );

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const neighbor of graph.neighbors(next[0])) {
        if (seen.has(neighbor[0])) {
          continue;
        }

        seen = seen.add(neighbor[0]);
        queue.push([...neighbor, next[0]]);
      }
    }
  };
}
