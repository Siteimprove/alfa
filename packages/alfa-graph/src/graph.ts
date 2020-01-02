import { Equatable } from "@siteimprove/alfa-equatable";
import { Map } from "@siteimprove/alfa-map";
import { Set } from "@siteimprove/alfa-set";

export class Graph<T> implements Iterable<[T, Iterable<T>]>, Equatable {
  public static empty<T>(): Graph<T> {
    return new Graph(Map.empty());
  }

  private readonly _nodes: Map<T, Set<T>>;

  private constructor(nodes: Map<T, Set<T>>) {
    this._nodes = nodes;
  }

  public get size(): number {
    return this._nodes.size;
  }

  public has(node: T): boolean {
    return this._nodes.has(node);
  }

  public add(node: T): Graph<T> {
    const { _nodes: nodes } = this;

    if (nodes.has(node)) {
      return this;
    }

    return new Graph(nodes.set(node, Set.empty()));
  }

  public delete(node: T): Graph<T> {
    let { _nodes: nodes } = this;

    if (!nodes.has(node)) {
      return this;
    }

    for (const to of nodes.get(node).get()) {
      nodes = nodes.set(
        to,
        nodes
          .get(to)
          .map(to => to.delete(node))
          .get()
      );
    }

    return new Graph(nodes.delete(node));
  }

  public connect(from: T, to: T): Graph<T> {
    let { _nodes: nodes } = this;

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
          .map(from => from.add(to))
          .get()
      )
    );
  }

  public disconnect(from: T, to: T): Graph<T> {
    const { _nodes: nodes } = this;

    if (!nodes.has(from) || !nodes.has(to)) {
      return this;
    }

    return new Graph(
      nodes.set(
        from,
        nodes
          .get(from)
          .map(from => from.delete(to))
          .get()
      )
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Graph && value._nodes.equals(this._nodes);
  }

  public *[Symbol.iterator](): Iterator<[T, Iterable<T>]> {
    yield* this._nodes;
  }

  public toJSON() {
    return {
      nodes: this._nodes.map(edges => edges.toJSON()).toJSON()
    };
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
