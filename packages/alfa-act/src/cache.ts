import { Branched } from "@siteimprove/alfa-branched";
import { Thunk } from "@siteimprove/alfa-thunk";

import { Outcome } from "./outcome";
import { Rule } from "./rule";

type Outcomes<I, T, Q, B> = Branched<Iterable<Outcome<I, T, Q, B>>, B>;

export class Cache {
  public static empty(): Cache {
    return new Cache();
  }

  private readonly storage = new WeakMap<object, unknown>();

  private constructor() {}

  public get<I, T, Q, B>(
    rule: Rule<I, T, Q, B>,
    ifMissing: Thunk<Outcomes<I, T, Q, B>>
  ): Outcomes<I, T, Q, B> {
    let outcomes = this.storage.get(rule) as Outcomes<I, T, Q, B> | undefined;

    if (outcomes === undefined) {
      outcomes = ifMissing();
      this.storage.set(rule, outcomes);
    }

    return outcomes;
  }
}
