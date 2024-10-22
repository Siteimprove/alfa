/// <reference lib="dom" />

/*
 * Performance measurement comes from different places in NodeJS and browser
 * environments. The former uses node:perf_hooks, while the latter uses the
 * global performance object. Trying to use the wrong one leads to at best
 * undefined value, at worst compile errors at build time.
 *
 * It seems to not be that easy to polyfill between the two. While it is easy
 * to test whether performance is defined, trying to import perf_hooks is enough
 * to crash bundlers like Webpack.
 *
 * Therefore, we just ignore node:perf_hooks and defaults to the widely available
 * Date.now() if the performance object is not available.
 */

import type { Thunk } from "@siteimprove/alfa-thunk";

export const now: Thunk<number> =
  typeof performance !== "undefined"
    ? () => performance.now()
    : () => Date.now();
