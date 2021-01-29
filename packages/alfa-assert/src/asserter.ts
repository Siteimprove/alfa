import { Rule } from "@siteimprove/alfa-act";
import { Mapper } from "@siteimprove/alfa-mapper";

import { Assertion } from "./assertion";
import { Handler } from "./handler";

export class Asserter<I, T, Q> {
  public static of<I, T, Q>(
    rules: Iterable<Rule<I, T, Q>>,
    handlers: Iterable<Handler<I, T, Q>> = [],
    options: Asserter.Options = {}
  ): Asserter<I, T, Q> {
    return new Asserter(Array.from(rules), Array.from(handlers), options);
  }

  private readonly _rules: Array<Rule<I, T, Q>>;
  private readonly _handlers: Array<Handler<I, T, Q>>;
  private readonly _options: Asserter.Options;

  private constructor(
    rules: Array<Rule<I, T, Q>>,
    handlers: Array<Handler<I, T, Q>>,
    options: Asserter.Options
  ) {
    this._rules = rules;
    this._handlers = handlers;
    this._options = options;
  }

  public get expect(): Mapper<I, Assertion<I, T, Q>> {
    return (input: I) =>
      Assertion.of(input, this._rules, this._handlers, this._options);
  }
}

export namespace Asserter {
  export interface Options extends Assertion.Options {}
}
