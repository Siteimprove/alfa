import { test } from "@siteimprove/alfa-test";
import { intersect } from "../../src/set/intersect";

test("Can find the intersection of two sets", t => {
  const a = new Set([1, true, "3"]);
  const b = new Set([true, "3"]);
  t.deepEqual(intersect(a, b), new Set([true, "3"]));
});
