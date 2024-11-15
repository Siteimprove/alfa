import { test } from "@siteimprove/alfa-test";

import { String } from "../dist/string.js";

test(".hasSoftWrapOpportunity() accepts dashes", (t) => {
  t.deepEqual(String.hasSoftWrapOpportunity("foo-bar"), true);
});
