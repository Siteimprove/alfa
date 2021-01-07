/// <reference lib="dom" />

import { Thunk } from "@siteimprove/alfa-thunk";

declare const require: (module: string) => any;

export let now: Thunk<number>;

if (typeof performance !== "undefined") {
  now = performance.now;
} else {
  try {
    now = require("perf_hooks").performance.now;
  } catch {
    now = Date.now;
  }
}
