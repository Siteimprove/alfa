import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { hasAttribute } from "../src/has-attribute";

test("Returns true when attribute is defined", t => {
  const foo = <p aria-label="bar" />;
  t.equal(hasAttribute(foo, "aria-label"), true);
});

test("Returns false when attribute is not defined", t => {
  const foo = <p>Foo</p>;
  t.equal(hasAttribute(foo, "aria-label"), false);
});
