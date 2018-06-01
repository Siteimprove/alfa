import { test } from "@siteimprove/alfa-test";
import { markdown } from "../src/markdown";
import { Manual } from "./helpers/rules";

test("Creates an ACT compliant markdown version of a rule", t => {
  const md = markdown(Manual, "en");

  t.true(md !== "");
});
