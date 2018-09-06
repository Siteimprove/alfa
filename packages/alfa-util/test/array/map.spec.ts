import { test } from "@siteimprove/alfa-test";
import { map } from "../../src/array/map";

test("Can group by element in array", t => {
  const input = [1, 3, 4];
  const expected = [2, 6, 8];
  const predicate = (k: number) => k * 2;

  t.deepEqual(map(input, predicate), expected);
});
