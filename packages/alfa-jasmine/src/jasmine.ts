/// <reference types="jasmine" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Hashable } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";

import { addAsyncMatcher } from "./jasmine/add-async-matcher";

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeAccessible(): Promise<void>;
    }
  }
}

/**
 * @public
 */
export namespace Jasmine {
  export function createPlugin<I, J, T extends Hashable, Q = never, S = T>(
    transform: Mapper<I, Promise<J>>,
    rules: Iterable<Rule<J, T, Q, S>>,
    handlers: Iterable<Handler<J, T, Q, S>> = [],
    options: Asserter.Options<J, T, Q, S> = {}
  ): void {
    const asserter = Asserter.of(rules, handlers, options);

    addAsyncMatcher("toBeAccessible", (util) => {
      return {
        async compare(value: I) {
          const input = await transform(value);

          const result = await asserter.expect(input).to.be.accessible();

          const message = result.isOk() ? result.get() : result.getErr();

          return {
            pass: result.isOk(),
            message:
              util.buildFailureMessage("toBeAccessible", result.isOk(), value) +
              " " +
              message,
          };
        },
      };
    });
  }
}
