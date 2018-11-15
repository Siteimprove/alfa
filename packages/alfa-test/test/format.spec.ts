import { AssertionError } from "assert";
import * as path from "path";
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
  t.equal(err.indexOf(`internal${path.sep}assert.js`) !== -1, true);
});
