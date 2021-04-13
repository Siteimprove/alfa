import { Callback } from "@siteimprove/alfa-callback";

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
