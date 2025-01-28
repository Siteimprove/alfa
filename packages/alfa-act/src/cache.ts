import type { Future } from "@siteimprove/alfa-future";
import type { Hashable } from "@siteimprove/alfa-hash";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Outcome } from "./outcome.js";
import type { Question } from "./question.js";
import type { Rule } from "./rule.js";

/**
 * @public
 */
export class Cache {
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
