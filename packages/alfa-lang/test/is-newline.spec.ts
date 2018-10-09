import { test } from "@siteimprove/alfa-test";
import { isNewline } from "../src/is-newline";

test("Returns true when character is a newline", t => {
  t.equal(isNewline("\n".charCodeAt(0)), true);
});

test("Returns false when character is not a newline", t => {
  t.equal(isNewline("F".charCodeAt(0)), false);
});
