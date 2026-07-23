import type { Hashable } from "@siteimprove/alfa-hash";
import type { Performance } from "@siteimprove/alfa-performance";

import { Event } from "./event.ts";
import type { Rule } from "./index.ts";

import type { Question } from "../expectation/index.ts";

/**
 * The performance object handed to a rule's `evaluate` function. It ties each
 * mark and measure to the enclosing rule so callers only need to supply a
 * name.
 *
 * @internal
 */
export interface RulePerformance<
  I,
  T extends Hashable,
  Q extends Question.Metadata,
  S,
> {
  mark(name: string): Performance.Mark<Event<I, T, Q, S>>;
  measure(name: string, start?: number): Performance.Measure<Event<I, T, Q, S>>;
}

/**
 * @internal
 */
export namespace RulePerformance {
  /**
   * Wraps a raw performance instance into one scoped to the given rule, so that
   * marks and measures are automatically tagged with `start`/`end` events for
   * that rule.
   *
   * @remarks
   * In the `evaluate` function passed to `Atomic.of`/`Composite.of`, `this` is
   * not yet built, so the rule has to be passed in explicitly here.
   */
  export function wrap<I, T extends Hashable, Q extends Question.Metadata, S>(
    rule: Rule<I, T, Q, S>,
    performance?: Performance<Event<I, T, Q, S>>,
  ): RulePerformance<I, T, Q, S> | undefined {
    return performance === undefined
      ? undefined
      : {
          mark: (name) => performance.mark(Event.start(rule, name)),
          measure: (name, start) =>
            performance.measure(Event.end(rule, name), start),
        };
  }
}
