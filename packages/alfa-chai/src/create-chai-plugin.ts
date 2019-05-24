/// <reference types="chai" />

import {
  Assertable,
  Assertion,
  AssertionError
} from "@siteimprove/alfa-assert";

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

        this.assert(
          error === null,
          `expected #{this} to be accessible${
            error === null
              ? ""
              : `, but ${util.inspect(error.target, false, 2, true)} is not: ${
                  error.message
                }`
          }`,
          "expected #{this} to not be accessible",
          null,
          error
        );
      }
    });
  };
}
