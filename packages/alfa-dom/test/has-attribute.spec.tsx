import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { hasAttribute } from "../src/has-attribute";

test("Returns true when attribute is defined", t => {
  t.equal(hasAttribute(<p aria-label="bar" />, "aria-label"), true);
});

test("Returns false when attribute is not defined", t => {
  t.equal(hasAttribute(<p>Foo</p>, "aria-label"), false);
});
