import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getClasslist } from "../src/get-classlist";

test("Constructs a set of classes from an element", async t => {
  t.deepEqual(
    [...getClasslist(<div class="foo bar baz" />)],
    ["foo", "bar", "baz"]
  );
});
