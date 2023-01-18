/// <reference types="chai" />

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Assertion, Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";

import * as assert from "@siteimprove/alfa-assert";

declare global {
  namespace Chai {
    interface Assertion {
      accessible<I, T extends Hashable, Q = never, S = T>(
        options?: assert.Assertion.Options<I, T, Q, S>
      ): Promise<void>;
    }
  }
}

/**
 * @public
 */
export namespace Chai {
  export function createPlugin<I, J, T extends Hashable, Q = never, S = T>(
    transform: Mapper<I, Future.Maybe<J>>,
    rules: Iterable<Rule<J, T, Q, S>>,
    handlers: Iterable<Handler<J, T, Q, S>> = [],
    options: Asserter.Options<J, T, Q, S> = {}
  ): globalThis.Chai.ChaiPlugin {
    const asserter = Asserter.of(rules, handlers, options);

    return (chai) => {
      chai.Assertion.addMethod(
        "accessible",
        async function (options: Assertion.Options<J, T, Q, S> = {}) {
          const input = await transform(this._obj);

          const result = await asserter
            .expect(input, options)
            .to.be.accessible();

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
        }
      );
    };
  }
}
