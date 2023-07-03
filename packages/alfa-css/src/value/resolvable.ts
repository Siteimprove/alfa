import type { Value } from "./value";

/**
 * @internal
 */
export interface Resolvable<T extends string, in R> {
  resolve(resolver?: R): Value<T, false>;
}

/**
 * @internal
 */
export namespace Resolvable {
  /**
   * The string representation of the resolved type of a value.
   * E.g. Value<"length-percentage", boolean, "length"> => "length".
   */
  export type Resolved<V extends Value> = V extends Value<
    string,
    boolean,
    infer R
  >
    ? R
    : string;

  /**
   * @privateRemarks
   * Somehow, applying `V extends Resolvable<string, infer R> ? R : never`
   * to a union distribute over the union (despite R being in contravariant
   * position in Resolvable), which is not what we want.
   * In order to resolve a `A | B`, we need to know how to resolve A **and**
   * how to resolve B, i.e. a `ResolverA & ResolverB`. So we manually switch the
   * union to un intersection.
   *
   * @privateRemarks
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
    V extends Resolvable<string, infer R> ? R : never
  >;
}
