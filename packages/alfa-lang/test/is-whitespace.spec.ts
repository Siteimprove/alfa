import { test } from "@siteimprove/alfa-test";
import { isWhitespace } from "../src/is-whitespace";

test("Returns true when character is a whitespace", t => {
  t.equal(isWhitespace(" ".charCodeAt(0)), true);
});

test("Returns false when character is not a whitespace", t => {
  t.equal(isWhitespace("F".charCodeAt(0)), false);
});
