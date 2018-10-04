import { test } from "@siteimprove/alfa-test";
import { isAscii } from "../src/is-ascii";

test("Returns true when passing an ascii character", t => {
  t.equal(isAscii("@".charCodeAt(0)), true);
});

test("Returns false when passing a non ascii character", t => {
  t.equal(isAscii("ø".charCodeAt(0)), false);
});
