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
    ifMissing: Thunk<Iterable<Outcome<I, T, Q>>>
  ): Iterable<Outcome<I, T, Q>> {
    let outcomes = this.storage.get(rule) as
      | Iterable<Outcome<I, T, Q>>
      | undefined;

    if (outcomes === undefined) {
      outcomes = ifMissing();
      this.storage.set(rule, outcomes);
    }

    return outcomes;
  }
}
