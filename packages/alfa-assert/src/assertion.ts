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
    const { filter = () => true, oracle = () => Future.now(None) } = {
      ...this._options,
    };

    return Audit.of<I, T, Q, S>(this._input, this._rules, oracle)
      .evaluate()
      .flatMap((outcomes) => {
        const failures = [...outcomes].filter(
          (outcome) => Outcome.isFailed(outcome) && filter(outcome)
        );

        const count = failures.length;

        const outcome = count === 1 ? "outcome was" : "outcomes were";

        const message = `${count} failed ${outcome} found`;

        if (count === 0) {
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
     * Predicate for filtering out outcomes that should not count towards an
     * assertion failure.
     */
    readonly filter?: Predicate<Outcome.Failed<I, T, Q, S>>;
    readonly oracle?: Oracle<I, T, Q, S>;
  }
}
