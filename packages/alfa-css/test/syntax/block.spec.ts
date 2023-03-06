import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Block, Token } from "../../src/";

const { consume } = Block;
const { whitespace, openParenthesis, closeParenthesis } = Token;

test(".consume() of empty returns error", (t) => {
  t.deepEqual(consume(Slice.empty()).toJSON(), {
    type: "err",
    error: "Expected open parenthesis or bracket",
  });
});

test(".consume() of invalid input returns error", (t) => {
  t.deepEqual(consume(Slice.of([whitespace()])).toJSON(), {
    type: "err",
    error: "Expected open parenthesis or bracket",
  });
});

test(".consume() parses empty parenthesis block", (t) => {
  t.deepEqual(
    consume(Slice.of([openParenthesis(), closeParenthesis()]))
      .map(([, block]) => block.toJSON())
      .get(),
    {
      token: {
        type: "open-parenthesis",
      },
      value: [],
    }
  );
});
