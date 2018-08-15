import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { hasAttribute } from "../src/has-attribute";

test("hasAttribute Returns True when Attribute is Defined", t => {
  const foo = <p aria-label="bar" />;
  t.equal(hasAttribute(foo, "aria-label"), true);
});

test("hasAttribute Returns False when Attribute is not Defined", t => {
  const foo = <p>Foo</p>;
  t.equal(hasAttribute(foo, "aria-label"), false);
});
