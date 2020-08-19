import { Predicate } from "@siteimprove/alfa-predicate";

import { Criterion } from "./criterion";

/**
 * This namespace defines types and functions for working with conformance-
 * related queries.
 *
 * @see https://www.w3.org/TR/WCAG/#conformance
 */
export namespace Conformance {
  /**
   * Check if a criterion is needed for the specified conformance level under
   * the specified version.
   */
  function hasLevel(
    level: Criterion.Level,
    version: Criterion.Version = Criterion.Version.Recommendation
  ): Predicate<Criterion> {
    return (criterion) =>
      criterion.level.some(
        (found, versions) => found <= level && [...versions].includes(version)
      );
  }

  /**
   * All criteria needed for conformance level A.
   */
  export type A<
    V extends Criterion.Version = Criterion.Version.Recommendation
  > = Criterion.Level.A<V>;

  /**
   * Check if a criterion is needed for level AA conformance under the
   * specified version.
   */
  export function isA<
    V extends Criterion.Version = Criterion.Version.Recommendation
  >(version?: V): Predicate<Criterion, Criterion<A<V>>> {
    return hasLevel("A", version);
  }

  /**
   * All criteria needed for level AA conformance.
   */
  export type AA<
    V extends Criterion.Version = Criterion.Version.Recommendation
  > = Criterion.Level.A<V> | Criterion.Level.AA<V>;

  /**
   * Check if a criterion is needed for level AA conformance under the
   * specified version.
   */
  export function isAA<
    V extends Criterion.Version = Criterion.Version.Recommendation
  >(version?: V): Predicate<Criterion, Criterion<A<V>>> {
    return hasLevel("AA", version);
  }

  /**
   * All criteria needed for level AAA conformance.
   */
  export type AAA<
    V extends Criterion.Version = Criterion.Version.Recommendation
  > = Criterion.Level.A<V> | Criterion.Level.AA<V> | Criterion.Level.AAA<V>;

  /**
   * Check if a criterion is needed for level AAA conformance under the
   * specified version.
   */
  export function isAAA<
    V extends Criterion.Version = Criterion.Version.Recommendation
  >(version?: V): Predicate<Criterion, Criterion<A<V>>> {
    return hasLevel("AAA", version);
  }
}
