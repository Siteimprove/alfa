import { Audit, Outcome, Rule } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Result, Err } from "@siteimprove/alfa-result";

import { Handler } from "./handler";

export class Assertion<I, T, Q> {
  public static of<I, T, Q>(
    input: I,
    rules: Iterable<Rule<I, T, Q>>,
    handlers: Iterable<Handler<I, T, Q>> = [],
    options: Assertion.Options = {}
  ): Assertion<I, T, Q> {
    return new Assertion(
      input,
      Array.from(rules),
      Array.from(handlers),
      options
    );
  }

  private readonly _input: I;
  private readonly _rules: Array<Rule<I, T, Q>>;
  private readonly _handlers: Array<Handler<I, T, Q>>;
  private readonly _options: Assertion.Options;

  private constructor(
    input: I,
    rules: Array<Rule<I, T, Q>>,
    handlers: Array<Handler<I, T, Q>>,
    options: Assertion.Options
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
    return Audit.of<I, T, Q>(this._input, this._rules)
      .evaluate()
      .flatMap((outcomes) => {
        const failures = [...outcomes].filter(Outcome.isFailed);

        const count = failures.length;

        const outcome = count === 1 ? "outcome" : "outcomes";

        const was = count === 1 ? "was" : "were";

        const message = `${count} failed ${outcome} ${was} found`;

        if (count === 0) {
          return Future.now(Result.of(message));
        }

        return this._handlers
          .reduce(
            (message, handler) =>
              message.flatMap((message) => {
                const future = handler(this._input, failures, message);

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

export namespace Assertion {
  export interface Options {}
}
