import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Nth } from "../../src/syntax/nth";

function parse(t: Assertions, input: string, expected: Nth.JSON) {
  t.deepEqual(
    Nth.parse(Slice.of(Lexer.lex(input)))
      .map(([, nth]) => nth)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test(".parse() parses an `an+b` expression", (t) => {
  parse(t, "6n+4", {
    step: 6,
    offset: 4,
  });
});

test(".parse() parses the `even` keyword", (t) => {
  parse(t, "even", {
    step: 2,
    offset: 0,
  });
});

test(".parse() parses the `odd` keyword", (t) => {
  parse(t, "odd", {
    step: 2,
    offset: 1,
  });
});

test(".parse() parses an `an+b` expression without the `an` part", (t) => {
  parse(t, "4", {
    step: 0,
    offset: 4,
  });
});

test(".parse() parses an `an+b` expression without the `b` part", (t) => {
  parse(t, "4n", {
    step: 4,
    offset: 0,
  });
});

test(".parse() parses an unsigned `an` and a signed `b`", (t) => {
  parse(t, "4n+6", {
    step: 4,
    offset: 6,
  });

  parse(t, "4n-6", {
    step: 4,
    offset: -6,
  });
});

test(".parse() parses a signed `an` and a signed `b`", (t) => {
  parse(t, "+4n+6", {
    step: 4,
    offset: 6,
  });

  parse(t, "+4n-6", {
    step: 4,
    offset: -6,
  });

  parse(t, "-4n+6", {
    step: -4,
    offset: 6,
  });

  parse(t, "-4n-6", {
    step: -4,
    offset: -6,
  });
});

test(".parse() parses a signed `an` and no `b`", (t) => {
  parse(t, "+4n", {
    step: 4,
    offset: 0,
  });

  parse(t, "-4n", {
    step: -4,
    offset: 0,
  });
});

test(".parse() parses a signed `b` and no `an`", (t) => {
  parse(t, "+6", {
    step: 0,
    offset: 6,
  });

  parse(t, "-6", {
    step: 0,
    offset: -6,
  });
});

test(".parse() parses an `an` with no `a`", (t) => {
  parse(t, "n", {
    step: 1,
    offset: 0,
  });

  parse(t, "-n", {
    step: -1,
    offset: 0,
  });
});

test(".parse() parses an `an` with no `a` and a `b`", (t) => {
  parse(t, "n+4", {
    step: 1,
    offset: 4,
  });

  parse(t, "-n+4", {
    step: -1,
    offset: 4,
  });

  parse(t, "n-4", {
    step: 1,
    offset: -4,
  });

  parse(t, "-n-4", {
    step: -1,
    offset: -4,
  });
});

test(".parse() accepts whitespace around the `b` sign when the `an` part it present", (t) => {
  parse(t, "4n + 6", {
    step: 4,
    offset: 6,
  });

  parse(t, "4n+ 6", {
    step: 4,
    offset: 6,
  });

  parse(t, "4n +6", {
    step: 4,
    offset: 6,
  });

  parse(t, "4n - 6", {
    step: 4,
    offset: -6,
  });

  parse(t, "4n- 6", {
    step: 4,
    offset: -6,
  });

  parse(t, "4n -6", {
    step: 4,
    offset: -6,
  });

  parse(t, "n + 6", {
    step: 1,
    offset: 6,
  });

  parse(t, "n+ 6", {
    step: 1,
    offset: 6,
  });

  parse(t, "n +6", {
    step: 1,
    offset: 6,
  });

  parse(t, "n - 6", {
    step: 1,
    offset: -6,
  });

  parse(t, "n- 6", {
    step: 1,
    offset: -6,
  });

  parse(t, "n -6", {
    step: 1,
    offset: -6,
  });
});
