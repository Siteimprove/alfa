import { test } from "@siteimprove/alfa-test";
import { isAlphanumeric } from "../src/is-alphanumeric";

test("Returns true when passing an alpha character", t => {
  t.equal(isAlphanumeric("A".charCodeAt(0)), true);
});

test("Returns true when passing a number character", t => {
  t.equal(isAlphanumeric("8".charCodeAt(0)), true);
});

test("Returns false when passing a special character", t => {
  t.equal(isAlphanumeric("@".charCodeAt(0)), false);
});
