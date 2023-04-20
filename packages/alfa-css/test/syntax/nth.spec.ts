import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Nth } from "../../src/syntax/nth";

function parse(input: string) {
  return Nth.parse(Lexer.lex(input)).map(([, nth]) => nth.toJSON());
}

test(".parse() parses an `an+b` expression", (t) => {
  t.deepEqual(parse("6n+4").getUnsafe(), {
    step: 6,
    offset: 4,
  });
});

test(".parse() parses the `even` keyword", (t) => {
  t.deepEqual(parse("even").getUnsafe(), {
    step: 2,
    offset: 0,
  });
});

test(".parse() parses the `odd` keyword", (t) => {
  t.deepEqual(parse("odd").getUnsafe(), {
    step: 2,
    offset: 1,
  });
});

test(".parse() parses an `an+b` expression without the `an` part", (t) => {
  t.deepEqual(parse("4").getUnsafe(), {
    step: 0,
    offset: 4,
  });
});

test(".parse() parses an `an+b` expression without the `b` part", (t) => {
  t.deepEqual(parse("4n").getUnsafe(), {
    step: 4,
    offset: 0,
  });
});

test(".parse() parses an unsigned `an` and a signed `b`", (t) => {
  t.deepEqual(parse("4n+6").getUnsafe(), {
    step: 4,
    offset: 6,
  });

  t.deepEqual(parse("4n-6").getUnsafe(), {
    step: 4,
    offset: -6,
  });
});

test(".parse() parses a signed `an` and a signed `b`", (t) => {
  t.deepEqual(parse("+4n+6").getUnsafe(), {
    step: 4,
    offset: 6,
  });

  t.deepEqual(parse("+4n-6").getUnsafe(), {
    step: 4,
    offset: -6,
  });

  t.deepEqual(parse("-4n+6").getUnsafe(), {
    step: -4,
    offset: 6,
  });

  t.deepEqual(parse("-4n-6").getUnsafe(), {
    step: -4,
    offset: -6,
  });
});

test(".parse() parses a signed `an` and no `b`", (t) => {
  t.deepEqual(parse("+4n").getUnsafe(), {
    step: 4,
    offset: 0,
  });

  t.deepEqual(parse("-4n").getUnsafe(), {
    step: -4,
    offset: 0,
  });
});

test(".parse() parses a signed `b` and no `an`", (t) => {
  t.deepEqual(parse("+6").getUnsafe(), {
    step: 0,
    offset: 6,
  });

  t.deepEqual(parse("-6").getUnsafe(), {
    step: 0,
    offset: -6,
  });
});

test(".parse() parses an `an` with no `a`", (t) => {
  t.deepEqual(parse("n").getUnsafe(), {
    step: 1,
    offset: 0,
  });

  t.deepEqual(parse("-n").getUnsafe(), {
    step: -1,
    offset: 0,
  });
});

test(".parse() parses an `an` with no `a` and a `b`", (t) => {
  t.deepEqual(parse("n+4").getUnsafe(), {
    step: 1,
    offset: 4,
  });

  t.deepEqual(parse("-n+4").getUnsafe(), {
    step: -1,
    offset: 4,
  });

  t.deepEqual(parse("n-4").getUnsafe(), {
    step: 1,
    offset: -4,
  });

  t.deepEqual(parse("-n-4").getUnsafe(), {
    step: -1,
    offset: -4,
  });
});

test(".parse() accepts whitespace around the `b` sign when the `an` part is present", (t) => {
  t.deepEqual(parse("4n + 6").getUnsafe(), {
    step: 4,
    offset: 6,
  });

  t.deepEqual(parse("4n+ 6").getUnsafe(), {
    step: 4,
    offset: 6,
  });

  t.deepEqual(parse("4n +6").getUnsafe(), {
    step: 4,
    offset: 6,
  });

  t.deepEqual(parse("4n - 6").getUnsafe(), {
    step: 4,
    offset: -6,
  });

  t.deepEqual(parse("4n- 6").getUnsafe(), {
    step: 4,
    offset: -6,
  });

  t.deepEqual(parse("4n -6").getUnsafe(), {
    step: 4,
    offset: -6,
  });

  t.deepEqual(parse("n + 6").getUnsafe(), {
    step: 1,
    offset: 6,
  });

  t.deepEqual(parse("n+ 6").getUnsafe(), {
    step: 1,
    offset: 6,
  });

  t.deepEqual(parse("n +6").getUnsafe(), {
    step: 1,
    offset: 6,
  });

  t.deepEqual(parse("n - 6").getUnsafe(), {
    step: 1,
    offset: -6,
  });

  t.deepEqual(parse("n- 6").getUnsafe(), {
    step: 1,
    offset: -6,
  });

  t.deepEqual(parse("n -6").getUnsafe(), {
    step: 1,
    offset: -6,
  });
});
