/// <reference types="chai" />

import {
  Assertable,
  Assertion,
  AssertionError
} from "@siteimprove/alfa-assert";
import { serialize } from "@siteimprove/alfa-dom";

// tslint:disable:no-any
// tslint:disable:no-unsafe-any

declare global {
  namespace Chai {
    interface Assertion {
      accessible: Promise<void>;
    }
  }
}

export function createChaiPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Assertable | Promise<Assertable>
): (chai: any, util: any) => void {
  return (chai, util) => {
    chai.Assertion.addProperty("accessible", async function(this: typeof chai) {
      const object = util.flag(this, "object");

      if (identify(object)) {
        const element = await transform(object);

        let error: AssertionError | null = null;
        try {
          new Assertion(element).should.be.accessible;
        } catch (err) {
          if (err instanceof AssertionError) {
            error = err;
          } else {
            throw err;
          }
        }

        let reason = "";

        if (error !== null) {
          reason = `, but ${util.inspect(
            serialize(error.target, element)
          )} is not: ${error.message}`;
        }

        this.assert(
          error === null,
          `expected #{this} to be accessible${reason}`,
          "expected #{this} to not be accessible",
          null,
          error
        );
      }
    });
  };
}
