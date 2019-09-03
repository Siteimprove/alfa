import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getClassList } from "../src/get-class-list";

test("Constructs a set of classes from an element", t => {
  const classList = getClassList(<div class="foo bar" />);

  t.deepEqual(classList, ["foo", "bar"]);
});

test("Ignores trailing whitespace", t => {
  const classList = getClassList(<div class=" foo bar " />);

  t.deepEqual(classList, ["foo", "bar"]);
});
