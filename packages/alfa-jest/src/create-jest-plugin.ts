import { expect as assert } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";
import "jest"; // tslint:disable-line

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
    }
  }
}

export function createJestPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): void {
  expect.extend({
    toBeAccessible: (target: unknown) => {
      if (identify(target)) {
        const error = assert(transform(target)).to.be.accessible;

        if (error === null) {
          return { pass: true, message: () => "Expected to be accessible" };
        }
      }

      return { pass: false, message: () => "Expected to not be accessible" };
    }
  })
}
