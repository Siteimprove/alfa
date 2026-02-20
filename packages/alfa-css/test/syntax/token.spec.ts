import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Token } from "../../dist/syntax/token.js";

const { ident, whitespace, parseWhitespace } = Token;

test("`parseWhiteSpace` handles empty slice of array with more whitespace after in underlying array", (t) => {
  // Slice is empty since start = end = 1,
  // but there is still a whitespace after the slice in the underlying array.
  // It should not parse the whitespace after the slice (and go into an infinite loop).
  // It does accept zero whitespace, leaving the slice untouched.
  const slice = Slice.of([ident("foo"), whitespace()], 1, 1);
  t.deepEqual(parseWhitespace(slice).toJSON(), {
    type: "ok",
    value: [slice.toJSON(), Token.whitespace().toJSON()],
  });
});
