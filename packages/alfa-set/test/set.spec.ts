import { test } from "@siteimprove/alfa-test";

import { Set} from "../src";

test("Set intersection is computed correctly", t => {
  t(Set.of(1, 2, 3).intersection(Set.of(2, 3, 4)).equals(Set.of(2, 3)));
  t(Set.empty().intersection(Set.of(2, 3, 4)).equals(Set.empty()));
  t(Set.of(1, 2, 3).intersection(Set.empty()).equals(Set.empty()));
});
