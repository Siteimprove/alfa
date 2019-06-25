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
  export namespace Chai {
    interface Assertion {
      accessible: void;
    }
  }
}

export function createChaiPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Assertable
): (chai: any, util: any) => void {
  return (chai, util) => {
    chai.Assertion.addProperty("accessible", function(this: typeof chai) {
      const object = util.flag(this, "object");

      if (identify(object)) {
        const element = transform(object);

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
          const target = util.inspect(serialize(error.target, element));

          reason = `, but ${target} is not: ${error.message}`;
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
