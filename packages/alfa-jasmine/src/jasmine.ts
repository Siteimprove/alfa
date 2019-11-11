/// <reference types="jasmine" />

import { Assert } from "@siteimprove/alfa-assert";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeAccessible(): T;
    }
  }
}

export namespace Jasmine {
  export function createPlugin<T>(
    identify: Predicate<unknown, T>,
    transform: Mapper<T, Page>
  ): void {
    beforeEach(() => {
      jasmine.addMatchers({
        toBeAccessible(util) {
          return {
            compare(value: unknown) {
              if (identify(value)) {
                const page = transform(value);

                const error = Assert.Page.isAccessible(page);

                return {
                  pass: error.isNone(),
                  message:
                    util.buildFailureMessage(
                      "toBeAccessible",
                      error.isNone(),
                      page
                    ) + (error.isNone() ? "" : ` ${error.toString()}`)
                };
              }

              return {
                pass: true,
                message: "Expected to not be accessible"
              };
            }
          };
        }
      });
    });
  }
}
