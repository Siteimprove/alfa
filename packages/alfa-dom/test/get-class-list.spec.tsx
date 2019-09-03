import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getClassList } from "../src/get-class-list";

test("Constructs a set of classes from an element", t => {
  const classList = getClassList(<div class="foo bar" />);

  t.deepEqual(classList, ["foo", "bar"]);
});

test("Ignores trailing whitespace", t => {
  const classList = getClassList(<div class=" foo bar " />);

  t.deepEqual(classList, ["foo", "bar"]);
});
