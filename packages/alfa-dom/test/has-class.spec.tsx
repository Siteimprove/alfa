import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import { hasClass } from "../src/has-class";

test("Returns true when an element has a given class name", t => {
  t.true(hasClass(<div class="foo bar" />, "foo"));
});

test("Returns false when an element does not have a given class name", t => {
  t.false(hasClass(<div class="foo bar" />, "baz"));
});
