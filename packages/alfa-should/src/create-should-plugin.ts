/// <reference path="../types/should.d.ts" />

import { AssertionError, expect } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import * as should from "should";

// tslint:disable:no-invalid-this

declare module "should" {
  interface Assertion {
    accessible(): this;
  }
}

export function createShouldPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): (should: should, Assertion: typeof should.Assertion) => void {
  return (should, Assertion) => {
    Assertion.add("accessible", function() {
      const object = this.obj;

      if (identify(object)) {
        let error: AssertionError | null = null;
        try {
          expect(transform(object)).to.be.accessible;
        } catch (err) {
          if (err instanceof AssertionError) {
            error = err;
          } else {
            throw err;
          }
        }

        const assertion = new should.Assertion(error);

        assertion.params = {
          operator: "to be accessible",
          message: error === null ? "to be accessible" : error.toString()
        };

        assertion.assert(error === null);
      }
    });
  };
}
