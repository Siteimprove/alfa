import { test } from "@siteimprove/alfa-test";
import { groupBy } from "../../src/array/group-by";

test("Can group by element in array", t => {
  const input = [1, 3, 4];
  const expected = new Map([[1, [1, 3]], [0, [4]]]);
  const predicate = (k: number) => k % 2;

  t.deepEqual(groupBy(input, predicate), expected);
});
