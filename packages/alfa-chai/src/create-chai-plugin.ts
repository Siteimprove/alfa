/// <reference types="chai" />

import { Assertion, AssertionError } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";

// tslint:disable:no-any

declare global {
  export namespace Chai {
    interface Assertion {
      accessible: void;
    }
  }
}

export function createChaiPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): (chai: any, util: any) => void {
  return (chai, util) => {
    chai.Assertion.addProperty("accessible", function(this: typeof chai) {
      const object = util.flag(this, "object");

      if (identify(object)) {
        const element = transform(object);

        console.log(element);

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
          error!.toString(),
          "Expected to not be accessible"
        );
      }
    });
  };
}
