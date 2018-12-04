import { test } from "@siteimprove/alfa-test";
import { isObject } from "../../src/guard/is-object";

test("Guard tests that the input is an object", t => {
  t(isObject({}));
  t(!isObject(42));
});
