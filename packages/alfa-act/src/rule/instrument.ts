import type { Hashable } from "@siteimprove/alfa-hash";
import type { Performance } from "@siteimprove/alfa-performance";

import { Event } from "./event.ts";
import type { Rule } from "./index.ts";

import type { Question } from "../expectation/index.ts";

/**
 * Instruments a single rule's evaluation. Each {@link Instrument.phase} call
 * brackets a named span of work with paired `start`/`end` performance marks,
 * tying both to the enclosing rule so callers only supply a name.
 *
 * When no performance instance is present, the bracket is a no-op that simply
 * runs the work.
 *
 * @public
 */
export class Instrument<I, T extends Hashable, Q extends Question.Metadata, S> {
  public static of<I, T extends Hashable, Q extends Question.Metadata, S>(
    rule: Rule<I, T, Q, S>,
    performance?: Performance<Event<I, T, Q, S>>,
  ): Instrument<I, T, Q, S> {
    return new Instrument(rule, performance);
  }

  private readonly _rule: Rule<I, T, Q, S>;
  private readonly _performance?: Performance<Event<I, T, Q, S>>;

  protected constructor(
    rule: Rule<I, T, Q, S>,
    performance?: Performance<Event<I, T, Q, S>>,
  ) {
    this._rule = rule;
    this._performance = performance;
  }

  /**
   * Runs `work`, bracketing it with a `start` mark and an `end` measure both
   * named `name`. Returns the result of `work`. The `end` measure is emitted
   * even if `work` rejects. When no performance instance is present, `work`
   * runs with no marks at all.
   */
  public async phase<O>(name: string, work: () => O | Promise<O>): Promise<O> {
    const performance = this._performance;

    if (performance === undefined) {
      return work();
    }

    const start = performance.mark(Event.of("start", this._rule, name)).start;

    try {
      return await work();
    } finally {
      performance.measure(Event.of("end", this._rule, name), start);
    }
  }
}
