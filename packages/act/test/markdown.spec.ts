import { test } from "@alfa/test";

import { UNIQUE_IDS } from "@alfa/wcag";

import { markdown } from "../src/markdown";

test("Creates an ACT compliant markdown version of a rule", async t => {
  const md = markdown(UNIQUE_IDS, "en");

  t.true(md !== "");
});
