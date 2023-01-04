/// <reference types="jest" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeAccessible(): Promise<void>;
    }
  }
}

/**
 * @public
 */
export namespace Jest {
  export function createPlugin<I, J, T extends Hashable, Q = never, S = T>(
    transform: Mapper<I, Future.Maybe<J>>,
    rules: Iterable<Rule<J, T, Q, S>>,
    handlers: Iterable<Handler<J, T, Q, S>> = [],
    options: Asserter.Options<J, T, Q, S> = {}
  ): void {
    const asserter = Asserter.of(rules, handlers, options);

    expect.extend({
      async toBeAccessible(value: I) {
        const input = await transform(value);

        const result = await asserter.expect(input).to.be.accessible();

        const message = result.isOk() ? result.get() : result.getErr();

        return {
          pass: result.isOk(),
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
