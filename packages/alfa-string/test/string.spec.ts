import { test } from "@siteimprove/alfa-test";

import { String } from "../dist/string.js";

test(".hasSoftWrapOpportunity() accepts dashes", (t) => {
  t.equal(String.hasSoftWrapOpportunity("foo-bar"), true);
});

test(".hasSoftWrapOpportunity() accepts spaces", (t) => {
  for (const space of [" ", "\t", "\n"]) {
    t.equal(String.hasSoftWrapOpportunity(`foo${space}bar`), true);
  }
});

test(".hasSoftWrapOpportunity() rejects non breaking spaces", (t) => {
  // non-break space and zero-width no-break space
  for (const space of ["\u{00A0}", "\u{FEFF}"]) {
    t.equal(String.hasSoftWrapOpportunity(`foo${space}bar`), false);
  }
});
