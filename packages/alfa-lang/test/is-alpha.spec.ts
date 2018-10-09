import { test } from "@siteimprove/alfa-test";
import { isAlpha } from "../src/is-alpha";

test("Returns true when passing an alpha character", t => {
  t.equal(isAlpha("A".charCodeAt(0)), true);
});

test("Returns false when passing a special character", t => {
  t.equal(isAlpha("@".charCodeAt(0)), false);
});
