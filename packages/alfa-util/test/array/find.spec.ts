import { test } from "@siteimprove/alfa-test";
import { find } from "../../src/array/find";

test("Can find element in array", t => {
  const input = [1, 3, 4];
  const predicate = (n: number) => n % 3 === 0;

  t.equal(find(input, predicate), 3);
});
