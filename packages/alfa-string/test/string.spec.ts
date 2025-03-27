import { test } from "@siteimprove/alfa-test";

import { String } from "../dist/string.js";

test(".hasSoftWrapOpportunity() accepts dashes", (t) => {
  t(String.hasSoftWrapOpportunity("foo-bar"));
});

test(".hasSoftWrapOpportunity() accepts spaces", (t) => {
  for (const space of [" ", "\t", "\n", /* zero width space */ "\u200B"]) {
    t(String.hasSoftWrapOpportunity(`foo${space}bar`));
  }
});

test(".hasSoftWrapOpportunity() rejects non breaking spaces", (t) => {
  // non-break space and zero-width no-break space
  for (const space of ["\u00A0", "\uFEFF"]) {
    t(!String.hasSoftWrapOpportunity(`foo${space}bar`));
  }
});
