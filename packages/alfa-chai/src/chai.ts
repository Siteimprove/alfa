/// <reference types="chai" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Mapper } from "@siteimprove/alfa-mapper";

declare global {
  namespace Chai {
    interface Assertion {
      accessible(): Promise<void>;
    }
  }
}

/**
 * @public
 */
export namespace Chai {
  export function createPlugin<I, J, T = unknown, Q = never>(
    transform: Mapper<I, Future.Maybe<J>>,
    rules: Iterable<Rule<J, T, Q>>,
    handlers: Iterable<Handler<J, T, Q>> = [],
    options: Asserter.Options = {}
  ): globalThis.Chai.ChaiPlugin {
    const asserter = Asserter.of(rules, handlers, options);

    return (chai) => {
      chai.Assertion.addMethod("accessible", async function () {
        const input = await transform(this._obj);

        const result = await asserter.expect(input).to.be.accessible();

        const message = result.isOk() ? result.get() : result.getErr();

        this.assert(
          result.isOk(),
          `expected #{this} to be accessible${
            result.isErr() ? ` but ${message}` : ""
          }`,
          `expected #{this} to not be accessible${
            result.isOk() ? ` but ${message}` : ""
          }`,
          /* Expected */ true,
          /* Actual */ result.isOk(),
          /* Show diff */ false
        );
      });
    };
  }
}
