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

  // Assert that we get the location of the error
  t.equal(err.indexOf("internal/assert.js:268") !== -1, true);
});
