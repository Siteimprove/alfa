import { test } from "@siteimprove/alfa-test";
import { hasKey } from "../../src/guard/has-key";

test("Guard tests that an object has a specific key", t => {
  t(hasKey({ foo: "bar" }, "foo"));
  t(!hasKey({ foo: "bar" }, "bar"));
});
