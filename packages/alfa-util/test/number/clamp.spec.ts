import { test } from "@siteimprove/alfa-test";
import { clamp } from "../../src/number/clamp";

test("Can clamp a number", t => {
  t.equal(clamp(7, 0, 1), 1);
  t.equal(clamp(0.5, 0, 1), 0.5);
  t.equal(clamp(Number.NEGATIVE_INFINITY, 0, 1), 0);
});
