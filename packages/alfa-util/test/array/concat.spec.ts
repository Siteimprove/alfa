import { test } from "@siteimprove/alfa-test";
import { concat } from "../../src/array/concat";

test("Can concat two arrays", t => {
  const a = [1, true, "3"];
  const b = [true, "3"];

  t.deepEqual(concat(a, b), [...a, ...b]);
});
