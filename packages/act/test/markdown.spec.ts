import { test } from "@alfa/test";
import { UniqueIds } from "@alfa/wcag";
import { markdown } from "../src/markdown";

test("Creates an ACT compliant markdown version of a rule", async t => {
  const md = markdown(UniqueIds, "en");

  t.true(md !== "");
});
