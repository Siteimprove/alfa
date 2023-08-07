import type { Value } from "./value";

/**
 * @internal
 */
export interface Resolvable<V extends Value<string, false>, in R> {
  resolve(resolver?: R): V;
}

/**
 * @internal
 */
export namespace Resolvable {
  /**
   * The actual type a value resolves to.
   */
  export type Resolved<V extends Value> = V extends Resolvable<infer U, unknown>
    ? U
    : V;

  /**
   * @privateRemarks
   * Somehow, applying `V extends Resolvable<Value, infer R> ? R : never`
   * to a union distribute over the union (despite R being in contravariant
   * position in Resolvable), which is not what we want.
   * In order to resolve a `A | B`, we need to know how to resolve A **and**
   * how to resolve B, i.e. a `ResolverA & ResolverB`. So we manually switch the
   * union to an intersection.
   *
   * This type first turns the union U into a union of functions, putting U in a
   * contravariant position, then infers the type of the argument of this union
   * of functions.
   * It does not work well with some specific internal types. E.g. internally,
   * `boolean = true | false`, so
   * `UnionToIntersection<boolean> = true & false = never`.
   *
   * {@link https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type}
   */
  type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  /**
   * The type of the resolver needed to resolve a given Value.
   */
  export type Resolver<V extends Value> = UnionToIntersection<
    // We first need to remove the `never` resolver from the union, to avoid
    // everything collapsing to `unknown`.
    V extends Resolvable<Value<string, false>, never>
      ? never
      : V extends Resolvable<Value<string, false>, infer R>
      ? R
      : never
  >;
}
