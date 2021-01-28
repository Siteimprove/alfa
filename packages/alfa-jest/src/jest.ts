/// <reference types="jest" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Mapper } from "@siteimprove/alfa-mapper";

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeAccessible(): Promise<void>;
    }
  }
}

export namespace Jest {
  export function createPlugin<I, J, T = unknown, Q = never>(
    transform: Mapper<I, Future.Maybe<J>>,
    rules: Iterable<Rule<J, T, Q>>,
    handlers: Iterable<Handler<J, T, Q>> = [],
    options: Asserter.Options = {}
  ): void {
    const asserter = Asserter.of(rules, handlers, options);

    expect.extend({
      async toBeAccessible(value: I) {
        const input = await transform(value);

        const error = await asserter.expect(input).to.be.accessible();

        const message = error.isOk() ? error.get() : error.getErr();

        return {
          pass: error.isOk(),
          message: () =>
            this.utils.matcherHint("toBeAccessible", "received", "", {
              isNot: this.isNot,
            }) +
            " but " +
            message,
        };
      },
    });
  }
}
