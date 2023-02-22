import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { RGB, Token } from "../../../src";

const { parse } = RGB;
const { func, number, comma, whitespace, closeParenthesis } = Token;

test("parse() parses consecutive whitespace", (t) => {
  const tokens = Slice.of([
    func("rgba"),
    number(255, true, false),
    comma(),
    whitespace(),
    number(255, true, false),
    comma(),
    whitespace(),
    number(255, true, false),
    comma(),
    whitespace(),
    whitespace(),
    number(1, true, false),
    closeParenthesis(),
  ]);
    
  const result = parse(tokens).map(([_, color]) => color.toJSON());

  t.deepEqual(result.get(), {
    type: "color",
    format: "rgb",
    red: {
      value: 255,
      type: "number",
    },
    green: {
      value: 255,
      type: "number",
    },
    blue: {
      value: 255,
      type: "number",
    },
    alpha: {
      value: 1,
      type: "number",
    },
  });
});
