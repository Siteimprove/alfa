import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { hasAttribute } from "../src/has-attribute";

const p = <p title="foo" />;

test("hasAttribute() returns true when an attribute exists on an element", t => {
  t.equal(hasAttribute(p, p, "title"), true);
});

test("hasAttribute() returns false when an attribute does not exist on an element", t => {
  t.equal(hasAttribute(p, p, "hidden"), false);
});
