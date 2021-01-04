/// <reference types="jest" />

import { Assert } from "@siteimprove/alfa-assert";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Page } from "@siteimprove/alfa-web";

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeAccessible(): Promise<void>;
    }
  }
}

export namespace Jest {
  export function createPlugin<T>(
    identify: Refinement<unknown, T>,
    transform: Mapper<T, Page>
  ): void {
    expect.extend({
      async toBeAccessible(value: unknown) {
        let error: Option<Assert.Error<Assert.Page.Target>> = None;

        if (identify(value)) {
          error = await Assert.Page.isAccessible(transform(value));
        }

        return {
          pass: error.isNone(),
          message: () =>
            this.utils.matcherHint("toBeAccessible", "received", "", {
              isNot: this.isNot,
            }),
        };
      },
    });
  }
}
