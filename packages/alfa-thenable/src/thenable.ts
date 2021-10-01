import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Continuation } from "@siteimprove/alfa-continuation";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Refinement } from "@siteimprove/alfa-refinement";

const { isFunction, isObject } = Refinement;

/**
 * @remarks
 * This interface purposely defines only the bare minimum needed for awaitable
 * values and leaves out features like chaining of `.then()` calls and optional
 * rejection callbacks as available for promises.
 *
 * @public
 */
export interface Thenable<T, E = unknown> {
  then(resolved: Callback<T>, rejected: Callback<E>): void;
}

/**
 * @public
 */
export namespace Thenable {
  /**
   * Check if an unknown value implements the {@link (Thenable:interface)}
   * interface.
   */
  export function isThenable<T, E = unknown>(
    value: unknown
  ): value is Thenable<T, E> {
    return isObject(value) && isFunction(value.then);
  }

  export function empty(): Thenable<void, never> {
    return resolve(undefined);
  }

  export function resolve<T>(value: T): Thenable<T, never> {
    return defer((resolve) => {
      resolve(value);
    });
  }

  export function reject<E>(error: E): Thenable<never, E> {
    return defer((resolve, reject) => {
      reject(error);
    });
  }

  export function defer<T, E = unknown>(
    continuation: Continuation<T, void, [reject: Callback<E>]>
  ): Thenable<T, E> {
    return new (class Thenable {
      then(resolve: Callback<T>, reject: Callback<E>) {
        continuation(resolve, reject);
      }
    })();
  }

  export function map<T, U, E = unknown>(
    thenable: Thenable<T, E>,
    mapper: Mapper<T, U>
  ): Thenable<U, E> {
    return defer((resolved, rejected) => {
      thenable.then((value) => resolved(mapper(value)), rejected);
    });
  }

  export function apply<T, U, E = unknown, F = E>(
    thenable: Thenable<T, E>,
    mapper: Thenable<Mapper<T, U>, F>
  ): Thenable<U, E | F> {
    return flatMap(mapper, (mapper) => map(thenable, mapper));
  }

  export function flatMap<T, U, E = unknown, F = E>(
    thenable: Thenable<T, E>,
    mapper: Mapper<T, Thenable<U, F>>
  ): Thenable<U, E | F> {
    return defer((resolved, rejected) => {
      thenable.then(
        (value) => mapper(value).then(resolved, rejected),
        rejected
      );
    });
  }

  export function flatten<T, E = unknown, F = E>(
    thenable: Thenable<Thenable<T, F>, E>
  ): Thenable<T, E | F> {
    return flatMap(thenable, (thenable) => thenable);
  }

  export function all<T, E = unknown>(
    ...thenables: Array<Thenable<T, E>>
  ): Thenable<Array<T>, E> {
    return defer((resolve, reject) => {
      const values = Array.allocate<T>(thenables.length);

      if (thenables.length === 0) {
        return resolve(values);
      }

      let unsettled = thenables.length;

      thenables.forEach((thenables, i) =>
        thenables.then(
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

  export function any<T, E = unknown>(
    ...thenables: Array<Thenable<T, E>>
  ): Thenable<T, Array<E>> {
    return defer((resolve, reject) => {
      const errors = Array.allocate<E>(thenables.length);

      if (thenables.length === 0) {
        return reject(errors);
      }

      let unsettled = thenables.length;

      thenables.forEach((thenables, i) =>
        thenables.then(
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

  export function race<T, E = unknown>(
    ...thenables: Array<Thenable<T, E>>
  ): Thenable<T, E> {
    return defer((resolve, reject) => {
      let unsettled = true;

      for (const thenable of thenables) {
        thenable.then(
          (value) => {
            if (unsettled) {
              unsettled = false;
              resolve(value);
            }
          },
          (error) => {
            if (unsettled) {
              unsettled = false;
              reject(error);
            }
          }
        );
      }
    });
  }
}
