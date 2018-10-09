import { test } from "@siteimprove/alfa-test";
import { isNumeric } from "../src/is-numeric";

test("Returns true when passing a numeric character", t => {
  t.equal(isNumeric("5".charCodeAt(0)), true);
});

test("Returns false when passing a special character", t => {
  t.equal(isNumeric("@".charCodeAt(0)), false);
});
