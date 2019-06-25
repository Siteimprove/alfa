/// <reference types="jest" />

import {
  Assertable,
  Assertion,
  AssertionError
} from "@siteimprove/alfa-assert";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
    }
  }
}

export function createJestPlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Assertable
): void {
  expect.extend({
    toBeAccessible: (target: unknown) => {
      if (identify(target)) {
        const element = transform(target);

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

        if (error !== null) {
          const message = error.toString();

          return {
            pass: false,
            message: () => message
          };
        }
      }

      return {
        pass: true,
        message: () => "Expected to not be accessible"
      };
    }
  });
}
