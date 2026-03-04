import type { Callback } from "@siteimprove/alfa-callback";

/**
 * @public
 */
export type Continuation<T, R = void, A extends Array<unknown> = []> = Callback<
  Callback<T, R>,
  R,
  A
>;
