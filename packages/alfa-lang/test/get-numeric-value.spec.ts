import { test } from "@siteimprove/alfa-test";
import { getNumericValue } from "../src/get-numeric-value";

test("Returns number, when passing a char code of a numeric character", t => {
  t.equal(getNumericValue("7".charCodeAt(0)), 7);
});

test("Returns number, when passing a char code of a uppercase character", t => {
  t.equal(getNumericValue("A".charCodeAt(0)), 10);
});

test("Returns number, when passing a char code of a lowercase character", t => {
  t.equal(getNumericValue("f".charCodeAt(0)), 15);
});

test("Returns null, when passing a non hexadecimal character", t => {
  t.equal(getNumericValue("@".charCodeAt(0)), null);
});
