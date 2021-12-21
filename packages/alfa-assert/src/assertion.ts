import { Audit, Oracle, Outcome, Rule } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Err } from "@siteimprove/alfa-result";

import { Handler } from "./handler";

/**
 * @public
 */
export class Assertion<I, T, Q, S> {
  public static of<I, T, Q, S>(
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
      oracle = () => Future.now(None),
    } = {
      ...this._options,
    };

    return Audit.of<I, T, Q, S>(this._input, this._rules, oracle)
      .evaluate()
      .flatMap((outcomes) => {
        // handling failures
        const failures = [...outcomes].filter(
          (outcome) => Outcome.isFailed(outcome) && filter(outcome)
        );

        const failuresCount = failures.length;
        const failuresOutcome =
          failuresCount === 1 ? "outcome was" : "outcomes were";
        const failuresMessage = `${failuresCount} failed ${failuresOutcome} found.`;

        // handling cantTell
        const cantTell = [...outcomes].filter(
          (outcome) => Outcome.isCantTell(outcome) && filterCantTell(outcome)
        );

        const cantTellCount = cantTell.length;
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
  export interface Options<I, T, Q, S> {
    /**
     * Predicate for filtering out outcomes that should count towards an
     * assertion failure.; only failed outcomes matching this filter will be
     * reported.
     * If left unset, all failed outcomes will be reported
     */
    readonly filter?: Predicate<Outcome.Failed<I, T, Q, S>>;
    /**
     * Filter cantTell outcome.
     * If left unset, no cantTell outcome will be reported.
     */
    readonly filterCantTell?: Predicate<Outcome.CantTell<I, T, Q, S>>;
    /**
     * Passing an oracle to the rules evaluation.
     */
    readonly oracle?: Oracle<I, T, Q, S>;
  }
}
