import { test } from "@alfa/test";
import { jsx } from "@alfa/jsx";
import { getClassList } from "../src/get-class-list";

test("Constructs a set of classes from an element", async t => {
  const classList = getClassList(<div class="foo bar" />);

  t.true(classList.has("foo"));
  t.true(classList.has("bar"));
  t.false(classList.has("baz"));
});
