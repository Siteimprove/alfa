import { Audit, Oracle, Outcome, Rule } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { None } from "@siteimprove/alfa-option";
import { Performance } from "@siteimprove/alfa-performance";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Handler } from "./handler";

const { or } = Predicate;

/**
 * @public
 */
export class Assertion<I, T extends Hashable, Q, S> {
  public static of<I, T extends Hashable, Q, S>(
    input: I,
    rules: Iterable<Rule<I, T, Q, S>>,
    handlers: Iterable<Handler<I, T, Q, S>> = [],
    options: Assertion.Options<I, T, Q, S> = {}
  ): Assertion<I, T, Q, S> {
    return new Assertion(
      input,
      Array.from(rules),
      Array.from(handlers),
      options
    );
  }

  private readonly _input: I;
  private readonly _rules: Array<Rule<I, T, Q, S>>;
  private readonly _handlers: Array<Handler<I, T, Q, S>>;
  private readonly _options: Assertion.Options<I, T, Q, S>;

  private constructor(
    input: I,
    rules: Array<Rule<I, T, Q, S>>,
    handlers: Array<Handler<I, T, Q, S>>,
    options: Assertion.Options<I, T, Q, S>
  ) {
    this._input = input;
    this._rules = rules;
    this._handlers = handlers;
    this._options = options;
  }

  public get to(): this {
    return this;
  }

  public get be(): this {
    return this;
  }

  public accessible(): Future<Result<string>> {
    const {
      // default: report all Failed outcome
      filter = () => true,
      // default: report no CantTell outcome
      filterCantTell = () => false,
      // default: answer no question
      oracle = () => Future.now(None),
      // default: no performance listener
      performance,
    } = {
      ...this._options,
    };

    return Audit.of<I, T, Q, S>(this._input, this._rules, oracle)
      .evaluate(performance)
      .flatMap((outcomes) => {
        // Since we need to go through `outcomes` twice, we can't keep it as
        // an Iterable which self-destruct on reading.
        // We also assume there will be few suspicious outcomes and therefore
        // filtering them once likely saves time
        const suspicious = Sequence.from(outcomes).filter(
          or(Outcome.isFailed, Outcome.isCantTell)
        );
        // handling failures
        const failures = suspicious.filter(
          (outcome) => Outcome.isFailed(outcome) && filter(outcome)
        );

        const failuresCount = failures.size;
        const failuresOutcome =
          failuresCount === 1 ? "outcome was" : "outcomes were";
        const failuresMessage = `${failuresCount} failed ${failuresOutcome} found.`;

        // handling cantTell
        const cantTell = suspicious.filter(
          (outcome) => Outcome.isCantTell(outcome) && filterCantTell(outcome)
        );

        const cantTellCount = cantTell.size;
        const cantTellOutcome =
          cantTellCount === 1 ? "outcome was" : "outcomes were";
        const cantTellMessage = `${cantTellCount} "can't Tell" ${cantTellOutcome} found.`;

        // Building final message
        const message = failuresMessage + " " + cantTellMessage;

        if (failuresCount + cantTellCount === 0) {
          return Future.now(Result.of(message));
        }

        return this._handlers
          .reduce(
            (message, handler) =>
              message.flatMap((message) => {
                const future = handler(
                  this._input,
                  this._rules,
                  failures,
                  message
                );

                if (Future.isFuture(future)) {
                  return future;
                }

                return Future.now(future);
              }),
            Future.now(message)
          )
          .map((message) => Err.of(message));
      });
  }
}

/**
 * @public
 */
export namespace Assertion {
  export interface Options<I, T extends Hashable, Q, S> {
    /**
     * Predicate for filtering outcomes that should count towards an assertion
     * failure.; only failed outcomes matching this filter will be reported.
     * If left unset, all failed outcomes will be reported
     */
    readonly filter?: Predicate<Outcome.Failed<I, T, Q, S>>;
    /**
     * Predicate for filtering cantTell outcome.
     * If left unset, no cantTell outcome will be reported.
     */
    readonly filterCantTell?: Predicate<Outcome.CantTell<I, T, Q, S>>;
    /**
     * Passing an oracle to the rules evaluation.
     */
    readonly oracle?: Oracle<I, T, Q, S>;
    /**
     * Passing a performance listener.
     */
    readonly performance?: Performance<Rule.Event<I, T, Q, S>>;
  }
}
