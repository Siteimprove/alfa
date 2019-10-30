import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { getClassList } from "../src/get-class-list";

test("getClassList() gets a set of classes from an element", t => {
  const element = <div class="foo bar" />;
  const classList = [...getClassList(element, element)];

  t.deepEqual(classList, ["foo", "bar"]);
});

test("getClassList() ignores trailing whitespace", t => {
  const element = <div class=" foo bar " />;
  const classList = [...getClassList(element, element)];

  t.deepEqual(classList, ["foo", "bar"]);
});
