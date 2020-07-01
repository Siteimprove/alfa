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

        const error = await asserter.expect(input).to.be.accessible();

        const message = error.isOk() ? error.get() : error.getErr();

        this.assert(
          error.isOk(),
          `expected #{this} to be accessible${
            error.isErr() ? ` but ${message}` : ""
          }`,
          `expected #{this} to not be accessible${
            error.isOk() ? ` but ${message}` : ""
          }`,
          /* Expected */ true,
          /* Actual */ error.isOk(),
          /* Show diff */ false
        );
      });
    };
  }
}
