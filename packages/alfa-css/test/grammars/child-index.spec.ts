import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { ChildIndexGrammar } from "../../src/grammars/child-index";
import { ChildIndex } from "../../src/types";

function childIndex(t: Assertions, input: string, expected: ChildIndex | null) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, ChildIndexGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a n-dimension signless-integer child index", t => {
  childIndex(t, "2n+3", {
    a: 2,
    b: 3
  });
});

test("Can parse a n-dimension child index", t => {
  childIndex(t, "n", {
    a: 1,
    b: 0
  });

  childIndex(t, "N", {
    a: 1,
    b: 0
  });

  childIndex(t, "-n", {
    a: -1,
    b: 0
  });

  childIndex(t, "--n", null);
});

test("Can parse a even odd child index", t => {
  childIndex(t, "even", {
    a: 2,
    b: 0
  });

  childIndex(t, "odd", {
    a: 2,
    b: 1
  });
});

test("Can parse a ndashdigit-dimension signed-integer child index", t => {
  childIndex(t, "-2n-3", {
    a: -2,
    b: -3
  });
});

test("Can parse a dashndashdigit-ident signed-integer child index", t => {
  childIndex(t, "-n-3", {
    a: -1,
    b: -3
  });
});

test("Can parse a ndashdigit-ident signed-integer child index", t => {
  childIndex(t, "n-3", {
    a: 1,
    b: -3
  });
});

test("Can parse a n-dimension signed-integer child index", t => {
  childIndex(t, "n + 3", {
    a: 1,
    b: 3
  });
});

test("Can parse a ndashdigit-dimension singless-integer child index", t => {
  childIndex(t, "-2n3", {
    a: -2,
    b: 3
  });
});

test("Can parse a number", t => {
  childIndex(t, "7", {
    a: 0,
    b: 7
  });

  childIndex(t, "-7", {
    a: 0,
    b: -7
  });
});
