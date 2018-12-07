import { test } from "@siteimprove/alfa-test";
import { isString } from "../../src/guard/is-string";

test("Guard tests that the input is a string", t => {
  t(isString("42"));
  t(!isString(42));
});
