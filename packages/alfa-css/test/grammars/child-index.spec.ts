import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { ChildIndexGrammar } from "../../src/grammars/child-index";
import { ChildIndex } from "../../src/types";

function childIndex(t: Assertions, input: string, expected: ChildIndex | null) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, ChildIndexGrammar);

  if (expected !== null) {
    t(parser.done, input);
  }

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a child index", t => {
  childIndex(t, "even", {
    step: 2,
    offset: 0
  });

  childIndex(t, "odd", {
    step: 2,
    offset: 1
  });

  childIndex(t, "7", {
    step: 0,
    offset: 7
  });

  childIndex(t, "-7", {
    step: 0,
    offset: -7
  });

  childIndex(t, "n", {
    step: 1,
    offset: 0
  });

  childIndex(t, "+n", {
    step: 1,
    offset: 0
  });

  childIndex(t, "-n", {
    step: -1,
    offset: 0
  });

  childIndex(t, "n+3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "n+ 3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "n +3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "n + 3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "+n+3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "+n+ 3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "+n +3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "+n + 3", {
    step: 1,
    offset: 3
  });

  childIndex(t, "-n+3", {
    step: -1,
    offset: 3
  });

  childIndex(t, "-n+ 3", {
    step: -1,
    offset: 3
  });

  childIndex(t, "-n +3", {
    step: -1,
    offset: 3
  });

  childIndex(t, "-n + 3", {
    step: -1,
    offset: 3
  });

  childIndex(t, "n-3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "n- 3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "n -3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "n - 3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "+n-3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "+n- 3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "+n -3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "+n - 3", {
    step: 1,
    offset: -3
  });

  childIndex(t, "-n-3", {
    step: -1,
    offset: -3
  });

  childIndex(t, "-n- 3", {
    step: -1,
    offset: -3
  });

  childIndex(t, "-n -3", {
    step: -1,
    offset: -3
  });

  childIndex(t, "-n - 3", {
    step: -1,
    offset: -3
  });

  childIndex(t, "2n+3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "2n+ 3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "2n +3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "2n + 3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "+2n+3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "+2n+ 3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "+2n +3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "+2n + 3", {
    step: 2,
    offset: 3
  });

  childIndex(t, "-2n+3", {
    step: -2,
    offset: 3
  });

  childIndex(t, "-2n+ 3", {
    step: -2,
    offset: 3
  });

  childIndex(t, "-2n +3", {
    step: -2,
    offset: 3
  });

  childIndex(t, "-2n + 3", {
    step: -2,
    offset: 3
  });

  childIndex(t, "2n-3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "2n- 3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "2n -3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "2n - 3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "+2n-3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "+2n- 3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "+2n -3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "+2n - 3", {
    step: 2,
    offset: -3
  });

  childIndex(t, "-2n-3", {
    step: -2,
    offset: -3
  });

  childIndex(t, "-2n- 3", {
    step: -2,
    offset: -3
  });

  childIndex(t, "-2n -3", {
    step: -2,
    offset: -3
  });

  childIndex(t, "-2n - 3", {
    step: -2,
    offset: -3
  });
});

test("Cannot parse an invalid child index", t => {
  const invalid = ["3.14", "3px", "3px7", "px", "-2n3+3"];

  for (const input of invalid) {
    childIndex(t, input, null);
  }
});
