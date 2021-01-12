import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Position } from "../../src";

const parser = Position.parseOld;

function parse(t: Assertions, input: string, expected: Position.JSON) {
  t.deepEqual(
    parser(Slice.of(Lexer.lex(input)))
      .map(([_, [horizontal, vertical]]) =>
        Position.of(horizontal.get(), vertical.get())
      )
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses left top", (t) => {
  parse(t, "left top", {
    type: "position",
    horizontal: {
      type: "side",
      offset: null,
      side: {
        type: "keyword",
        value: "left",
      },
    },
    vertical: {
      type: "side",
      offset: null,
      side: {
        type: "keyword",
        value: "top",
      },
    },
  });
});
