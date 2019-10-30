import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getId } from "../src/get-id";

test("getId() gets the ID of an element", t => {
  const div = <div id="bar" />;

  t.deepEqual(getId(div, div), Some.of("bar"));
});

test("getId() returns none when an element has no ID", t => {
  const div = <div />;

  t.equal(getId(div, div), None);
});
