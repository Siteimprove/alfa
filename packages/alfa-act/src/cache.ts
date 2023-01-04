import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Outcome } from "./outcome";
import { Rule } from "./rule";

/**
 * @public
 */
export class Cache {
  public static empty(): Cache {
    return new Cache();
  }

  private readonly _storage = new WeakMap<object, unknown>();

  private constructor() {}

  public get<I, T extends Hashable, Q, S>(
    rule: Rule<I, T, Q, S>,
    ifMissing: Thunk<Future<Iterable<Outcome<I, T, Q, S>>>>
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
