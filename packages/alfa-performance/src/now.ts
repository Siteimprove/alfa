/// <reference lib="dom" />

import { Thunk } from "@siteimprove/alfa-thunk";

import perfHooks from "node:perf_hooks";

export let now: Thunk<number>;

/**
 * The continuations are needed to correctly handle the "this" bindings.
 * Eta-contracting breaks in node 19.0.0 and above. This may be linked to the
 * upgrade to V8 10.7.
 *
 * Date.now actually works without the eta-expansion, keeping it for
 * consistency.
 */
if (typeof performance !== "undefined") {
  now = () => performance.now();
} else {
  try {
    now = () => perfHooks.performance.now();
  } catch {
    now = () => Date.now();
  }
}
