import { Future } from "@siteimprove/alfa-future";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Outcome } from "./outcome";
import { Rule } from "./rule";

export class Cache {
  public static empty(): Cache {
    return new Cache();
  }

  private readonly storage = new WeakMap<object, unknown>();

  private constructor() {}

  public get<I, T, Q>(
    rule: Rule<I, T, Q>,
    ifMissing: Thunk<Future<Iterable<Outcome<I, T, Q>>>>
  ): Future<Iterable<Outcome<I, T, Q>>> {
    let outcomes = this.storage.get(rule) as
      | Future<Iterable<Outcome<I, T, Q>>>
      | undefined;

    if (outcomes === undefined) {
      outcomes = ifMissing();
      this.storage.set(rule, outcomes);
    }

    return outcomes;
  }
}
