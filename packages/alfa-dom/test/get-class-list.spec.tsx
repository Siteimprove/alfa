import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import { getClassList } from "../src/get-class-list";

test("Constructs a set of classes from an element", t => {
  const classList = getClassList(<div class="foo bar" />);

  t.deepEqual(classList, ["foo", "bar"]);
});
