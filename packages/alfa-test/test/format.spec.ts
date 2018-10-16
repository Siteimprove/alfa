import { AssertionError } from "assert";
import { format } from "../src/format";
import { test } from "../src/test";

test("Can format a basic error", t => {
  const err = format(
    "Foo",
    new AssertionError({
      message: "Bar"
    })
  );

  const expected =
    "\n\u001b[1mFoo\u001b[22m\n\u001b[4minternal/assert.js:268\u001b[24m\n\nBar\n\nundefined undefined undefined\n";

  t.equal(err, expected);
});
