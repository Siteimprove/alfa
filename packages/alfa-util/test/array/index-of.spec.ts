import { test } from "@siteimprove/alfa-test";
import { indexOf } from "../../src/array/index-of";

test("Can find index of element in array", t => {
  const input = [1, 3, 4];

  t.equal(indexOf(input, 4), 2);
});
