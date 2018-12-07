/// <reference path="../types/chai.d.ts" />

import { AssertionError, expect } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import * as chai from "chai";

// tslint:disable:no-invalid-this

declare module "chai" {
  interface Assertion {
    accessible: void;
  }
}

export function createChaiPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): (chai: chai, util: chai.Util) => void {
  return (chai, util) => {
    const { Assertion } = chai;

    Assertion.addProperty("accessible", function() {
      const object = util.flag(this, "object");

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

        this.assert(
          error === null,
          error!.toString(),
          "Expected to not be accessible"
        );
      }
    });
  };
}
