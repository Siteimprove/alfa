import { Equatable } from "@siteimprove/alfa-equatable";
import { Graph } from "@siteimprove/alfa-graph";
import { Hashable, Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

export class Network<N, E>
  implements
    Iterable<[N, Iterable<[N, Iterable<E>]>]>,
    Equatable,
    Hashable,
    Serializable<Network.JSON<N, E>> {
  public static of<N, E>(nodes: Map<N, Map<N, Set<E>>>): Network<N, E> {
    return new Network(nodes);
  }

  private static _empty = new Network<never, never>(Map.empty());

  public static empty<N, E>(): Network<N, E> {
    return this._empty;
  }

  private readonly _nodes: Map<N, Map<N, Set<E>>>;

  private constructor(nodes: Map<N, Map<N, Set<E>>>) {
    this._nodes = nodes;
  }

  public get size(): number {
    return this._nodes.size;
  }

  public nodes(): Iterable<N> {
    return this._nodes.keys();
  }

  public neighbors(node: N): Iterable<[N, Iterable<E>]> {
    return this._nodes.get(node).getOr([]);
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
    let nodes = this._nodes;

    if (!nodes.has(node)) {
      return this;
    }

    return new Network(
      nodes.delete(node).map((neighbors) => neighbors.delete(node))
    );
  }

  public connect(from: N, to: N, edge: E, ...rest: Array<E>): Network<N, E>;

  public connect(from: N, to: N, ...edges: Array<E>): Network<N, E> {
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
                  edges.reduce((edges, edge) => edges.add(edge), existing)
                )
                .getOrElse(() => Set.from(edges))
            )
          )
          .get()
      )
    );
  }

  public disconnect(from: N, to: N): Network<N, E>;

  public disconnect(from: N, to: N, edge: E, ...rest: Array<E>): Network<N, E>;

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
                existing
              );

              if (existing.size === 0) {
                return from.delete(to);
              }

              return from.set(to, existing);
            }

            return from;
          })
          .get()
      )
    );
  }

  public traverse(
    root: N,
    traversal: Network.Traversal = Network.DepthFirst
  ): Sequence<N> {
    return Sequence.from(traversal(this, root));
  }

  public hasPath(from: N, to: N): boolean {
    if (!this.has(from) || !this.has(to)) {
      return false;
    }

    return this.traverse(from).includes(to);
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
      ])
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

export namespace Network {
  export type JSON<N, E> = Array<
    [
      Serializable.ToJSON<N>,
      Array<[Serializable.ToJSON<N>, Array<Serializable.ToJSON<E>>]>
    ]
  >;

  export function isNetwork<N, E>(
    value: Iterable<readonly [N, Iterable<readonly [N, Iterable<E>]>]>
  ): value is Network<N, E>;

  export function isNetwork<N, E>(value: unknown): value is Network<N, E>;

  export function isNetwork<N, E>(value: unknown): value is Network<N, E> {
    return value instanceof Network;
  }

  export function from<N, E>(
    iterable: Iterable<readonly [N, Iterable<readonly [N, Iterable<E>]>]>
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
            })
          ),
        ])
      )
    );
  }

  export interface Traversal {
    <N, E>(network: Network<N, E>, root: N): Iterable<N>;
  }

  /**
   * @see https://en.wikipedia.org/wiki/Depth-first_search
   */
  export const DepthFirst: Traversal = function* <N, E>(
    graph: Network<N, E>,
    root: N
  ) {
    const stack = [root];

    let seen = Set.empty<N>();

    while (stack.length > 0) {
      const next = stack.pop()!;

      if (seen.has(next)) {
        continue;
      }

      yield next;

      seen = seen.add(next);

      for (const [neighbor] of graph.neighbors(next)) {
        stack.push(neighbor);
      }
    }
  };

  /**
   * @see https://en.wikipedia.org/wiki/Breadth-first_search
   */
  export const BreadthFirst: Traversal = function* <N, E>(
    graph: Network<N, E>,
    root: N
  ) {
    const queue = [root];

    let seen = Set.of(root);

    while (queue.length > 0) {
      const next = queue.shift()!;

      yield next;

      for (const [neighbor] of graph.neighbors(next)) {
        if (seen.has(neighbor)) {
          continue;
        }

        seen = seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  };
}
