import { test } from "@siteimprove/alfa-test";

import { Real } from "../src/real.ts";

test(".clamp() prefers lower bound if they are in the wrong order", (t) => {
  // This is the behavior of clamp in CSS.
  t.equal(Real.clamp(1, 2, 0), 2);
});
