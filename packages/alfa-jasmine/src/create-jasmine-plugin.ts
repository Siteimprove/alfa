import { AssertionError, expect as assert } from "@siteimprove/alfa-assert";
import { Element } from "@siteimprove/alfa-dom";

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeAccessible(): T;
    }
  }
}

export function createJasminePlugin<T>(
  identify: (input: unknown) => input is T,
  transform: (input: T) => Element
): void {
  jasmine.addMatchers({
    toBeAccessible() {
      return {
        compare(target: unknown) {
          if (identify(target)) {
            let error: AssertionError | null = null;
            try {
              assert(transform(target)).to.be.accessible;
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
                message
              };
            }
          }

          return {
            pass: true,
            message: "Expected to not be accessible"
          };
        }
      };
    }
  });
}
