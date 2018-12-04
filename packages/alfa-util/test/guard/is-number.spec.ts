import { test } from "@siteimprove/alfa-test";
import { isNumber } from "../../src/guard/is-number";

test("Guard tests that the input is a number", t => {
  t(isNumber(42));
  t(!isNumber("42"));
});
