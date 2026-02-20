import { test } from "@siteimprove/alfa-test";

import { Real } from "../dist/real.js";

test(".clamp() prefers lower bound if they are in the wrong order", (t) => {
  // This is the behavior of clamp in CSS.
  t.equal(Real.clamp(1, 2, 0), 2);
});
