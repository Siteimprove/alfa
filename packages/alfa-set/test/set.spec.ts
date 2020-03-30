import { test } from "@siteimprove/alfa-test";

import { Set} from "../src";

test("Set intersection is computed correctly", t => {
  t.deepEqual(Set.of(1, 2, 3).intersection(Set.of(2, 3, 4)), Set.of(2, 3));
  t.deepEqual(Set.empty().intersection(Set.of(2, 3, 4)), Set.empty());
  t.deepEqual(Set.of(1, 2, 3).intersection(Set.empty()), Set.empty());
});

test("Set filtering is computed correctly", t => {
  t.deepEqual(Set.of(1, 2, 3, 4, 5).filter(n => n%2 === 0), Set.of(2, 4));
  t.deepEqual(Set.of(1, 3, 5).filter(n => n%2 === 0), Set.empty());
});
