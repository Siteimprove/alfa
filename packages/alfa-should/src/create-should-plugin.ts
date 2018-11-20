/// <reference path="../types/should.d.ts" />

import { expect } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import * as should from "should";

// tslint:disable:no-invalid-this

declare module "should" {
  interface Should {
    accessible: this;
  }
}

export function createShouldPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): void {
  should.Assertion.add("accessible", function() {
    const object = this.obj;

    if (identify(object)) {
      const error = expect(transform(object)).to.be.accessible;

      error!.should.be.null;
    }
  });
}
