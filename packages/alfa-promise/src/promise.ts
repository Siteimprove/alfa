import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Continuation } from "@siteimprove/alfa-continuation";

import * as global from "./global";

/**
 * @remarks
 * This is a re-export of the global `Promise` interface to ensure that it
 * merges with the `Promise` namespace.
 *
 * @public
 */
export type Promise<T> = globalThis.Promise<T>;

/**
 * @public
 */
export namespace Promise {
  export function isPromise<T>(value: unknown): value is Promise<T> {
    return resolve(value) === value;
  }

  export function empty(): Promise<void> {
    return resolve(undefined);
  }

  export function resolve<T>(value: T): Promise<T> {
    return global.Promise.resolve(value);
  }

  export function reject<T>(error: unknown): Promise<T> {
    return global.Promise.reject(error);
  }

  export function defer<T>(
    continuation: Continuation<T, void, [reject: Callback<unknown>]>
  ): Promise<T> {
    return new global.Promise(continuation);
  }

  export function all<T>(...promises: Array<Promise<T>>): Promise<Array<T>> {
    return defer((resolve, reject) => {
      const values = Array.allocate<T>(promises.length);

      if (promises.length === 0) {
        return resolve(values);
      }

      let unsettled = promises.length;

      promises.forEach((promise, i) =>
        promise.then(
          (value) => {
            values[i] = value;

            if (--unsettled === 0) {
              resolve(values);
            }
          },
          (error) => {
            reject(error);
          }
        )
      );
    });
  }

  export function any<T>(...promises: Array<Promise<T>>): Promise<T> {
    return defer((resolve, reject) => {
      const errors = Array.allocate(promises.length);

      if (promises.length === 0) {
        return reject(errors);
      }

      let unsettled = promises.length;

      promises.forEach((promise, i) =>
        promise.then(
          (value) => {
            resolve(value);
          },
          (error) => {
            errors[i] = error;

            if (--unsettled === 0) {
              reject(errors);
            }
          }
        )
      );
    });
  }

  export function race<T>(...promises: Array<Promise<T>>): Promise<T> {
    return defer((resolve, reject) => {
      for (const promise of promises) {
        promise.then(resolve, reject);
      }
    });
  }
}
