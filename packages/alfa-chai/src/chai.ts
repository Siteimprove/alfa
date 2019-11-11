/// <reference types="chai" />

import { Assert } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

// tslint:disable:no-any
// tslint:disable:no-unsafe-any

declare global {
  namespace Chai {
    interface Assertion {
      accessible: Promise<void>;
    }
  }
}

export namespace Chai {
  export function createPlugin<T>(
    identify: Predicate<unknown, T>,
    transform: Mapper<T, Future<Page>>
  ): (chai: any, util: any) => void {
    return (chai, util) => {
      chai.Assertion.addProperty("accessible", function(this: typeof chai) {
        const value = util.flag(this, "object");

        if (identify(value)) {
          return transform(value).map(page => {
            const error = Assert.Page.isAccessible(page).map(error => {
              const reasons = Iterable.join(error.reasons, "; ");

              return `, but ${util.inspect(error.target)} is not: ${reasons}`;
            });

            this.assert(
              error.isNone(),
              `expected #{this} to be accessible${error.getOr("")}`,
              "expected #{this} to not be accessible",
              null,
              error
            );
          });
        }
      });
    };
  }
}
