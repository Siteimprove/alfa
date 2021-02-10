/// <reference path="../types/unexpected.d.ts" />

import * as unexpected from "unexpected";

import { Rule } from "@siteimprove/alfa-act";
import { Asserter, Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Mapper } from "@siteimprove/alfa-mapper";

declare module "unexpected" {
  interface Expect {
    (
      subject: unknown,
      assertionName: "to be accessible" | "not to be accessible"
    ): Promise<void>;
  }
}

export namespace Unexpected {
  export function createPlugin<I, J, T = unknown, Q = never>(
    transform: Mapper<I, Future.Maybe<J>>,
    rules: Iterable<Rule<J, T, Q>>,
    handlers: Iterable<Handler<J, T, Q>> = [],
    options: Asserter.Options = {}
  ): unexpected.PluginDefinition {
    const asserter = Asserter.of(rules, handlers, options);

    return {
      name: "@siteimprove/alfa-unexpected",
      installInto(unexpected) {
        unexpected.addType({
          name: "Element",
          base: "object",
          identify(value: unknown): value is I {
            return true;
          },
          inspect(value, depth, output) {
            output.text(`${value}`);
          },
        });

        unexpected.addAssertion<I>(
          `<Element> [not] to be accessible`,
          async (expect, value) => {
            const target = await transform(value);

            const error = await asserter.expect(target).to.be.accessible();

            expect(error.isOk(), "[not] to be", true);
          }
        );
      },
    };
  }
}
