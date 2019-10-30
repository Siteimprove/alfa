import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { hasClass } from "../src/has-class";

const div = <div class="foo bar" />;

test("hasClass() returns true when an element has a given class name", t => {
  t(hasClass(div, div, "foo"));
});

test("hasClass() returns false when an element does not have a given class name", t => {
  t(!hasClass(div, div, "baz"));
});
