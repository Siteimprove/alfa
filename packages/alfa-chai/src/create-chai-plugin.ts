/// <reference path="../types/chai.d.ts" />

import { expect } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import * as chai from "chai";

// tslint:disable:no-invalid-this

export function createChaiPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): (chai: chai.Chai, utils: chai.Utils) => void {
  return (chai, utils) => {
    const { Assertion } = chai;

    Assertion.addProperty("accessible", function() {
      const object = utils.flag(this, "object");

      if (identify(object)) {
        const error = expect(transform(object)).to.be.accessible;

        this.assert(
          error === null,
          "Expected to be accessible",
          "Expected to not be accessible"
        );
      }
    });
  };
}
