import { test } from "@siteimprove/alfa-test";

import { Tuple } from "../dist/tuple.js";

test(".of() constructs a tuple", (t) => {
  t.deepEqual(Tuple.of(1, null, "foo"), [1, null, "foo"]);
});
