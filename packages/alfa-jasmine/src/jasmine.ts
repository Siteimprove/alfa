/// <reference types="jasmine" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Mapper } from "@siteimprove/alfa-mapper";

import { addAsyncMatcher } from "./jasmine/add-async-matcher";

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeAccessible(): Promise<void>;
    }
  }
}

export namespace Jasmine {
  export function createPlugin<I, J, T = unknown, Q = never>(
    transform: Mapper<I, Promise<J>>,
    rules: Iterable<Rule<J, T, Q>>,
    handlers: Iterable<Handler<J, T, Q>> = [],
    options: Asserter.Options = {}
  ): void {
    const asserter = Asserter.of(rules, handlers, options);

    addAsyncMatcher("toBeAccessible", (util) => {
      return {
        async compare(value: I) {
          const target = await transform(value);

          const error = await asserter.expect(target).to.be.accessible();

          const message = error.isOk() ? error.get() : error.getErr();

          return {
            pass: error.isOk(),
            message:
              util.buildFailureMessage("toBeAccessible", error.isOk(), value) +
              " " +
              message,
          };
        },
      };
    });
  }
}
