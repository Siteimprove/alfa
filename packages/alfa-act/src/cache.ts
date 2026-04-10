import type { Future } from "@siteimprove/alfa-future";
import type { Hashable } from "@siteimprove/alfa-hash";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Outcome } from "./outcome.ts";
import type { Question } from "./expectation/index.ts";
import type { Rule } from "./rule.ts";

/**
 * Cache from rules to outcomes.
 *
 * @remarks
 * This duplicates the cache from `alfa-cache` but adds a type link between
 * the keys (rules) and values (outcomes). That is, it is guaranteed that if
 * `rule` is `Rule<I, T, Q, S>`, then `cache.get(rule)` is `Outcome<I, T, Q, S>`
 * with the same type parameters. Such a link is not possible with the basic cache.
 *
 * These caches do nothing to remember the actual input that was concerned when
 * it was built. So care must be taken to ensure that they are not accidentally
 * shared between inputs, … This is normally enforced by keeping the cache local
 * to a given `Audit` where the input is fixed.
 *
 * @public
 */
export class Cache {
  // We do not want a singleton pattern here, as we need to create a fresh cache
  // on each new Audit.
  public static empty(): Cache {
    return new Cache();
  }

  private readonly _storage = new WeakMap<object, unknown>();

  protected constructor() {}

  public get<I, T extends Hashable, Q extends Question.Metadata, S>(
    rule: Rule<I, T, Q, S>,
    ifMissing: Thunk<Future<Iterable<Outcome<I, T, Q, S>>>>,
  ): Future<Iterable<Outcome<I, T, Q, S>>> {
    let outcomes = this._storage.get(rule) as
      | Future<Iterable<Outcome<I, T, Q, S>>>
      | undefined;

    if (outcomes === undefined) {
      outcomes = ifMissing();
      this._storage.set(rule, outcomes);
    }

    return outcomes;
  }
}
