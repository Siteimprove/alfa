import type { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Parser } from "../src/parser.js";

type Token = string;
type Input = Array<Token>;
type Output = string;
type BasicParser = Parser<Input, Output, string>;

type Res = [Input, Output];
const makeRes = (input: Input, output: Output): Res => [input, output];

function makeParser(isValid: Predicate<Token>): BasicParser {
  return (input) => {
    if (input.length === 0) {
      return Err.of("empty input");
    }

    if (isValid(input[0])) {
      return Ok.of(makeRes(input.slice(1), input[0]));
    }

    return Err.of(`invalid token: ${input[0]}`);
  };
}

const parseFoo = makeParser((token) => token === "foo");
const parseBar = makeParser((token) => token === "bar");
const parseBaz = makeParser((token) => token === "baz");
const parseAny = makeParser(() => true);
const noop: BasicParser = (input) => Ok.of(makeRes(input, ""));

test("makeParser works as expected", (t) => {
  t.deepEqual(parseFoo(["foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], "foo"],
  });
  t.deepEqual(parseFoo(["bar", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
  t.deepEqual(parseFoo([]).toJSON(), { type: "err", error: "empty input" });
});

test("Parser.map() transforms successful parse results", (t) => {
  const parser = Parser.map(parseFoo, (value) => value.toUpperCase());

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], "FOO"],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.mapResult() transforms with Result-returning mapper", (t) => {
  const parser = Parser.mapResult(parseAny, (value) =>
    value === "foo" ? Ok.of("success") : Err.of("unexpected"),
  );

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], "success"],
  });

  t.deepEqual(parser(["bar"]).toJSON(), { type: "err", error: "unexpected" });
});

test("Parser.flatMap() chains parsers", (t) => {
  const parser = Parser.flatMap(parseFoo, () => parseBar);

  t.deepEqual(parser(["foo", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], "bar"],
  });

  t.deepEqual(parser(["foo", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: baz",
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.filter() filters successful results", (t) => {
  const parser = Parser.filter(
    parseAny,
    (value) => value.length > 2,
    (value) => `too short: ${value}`,
  );

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], "foo"],
  });

  t.deepEqual(parser(["ab", "bar"]).toJSON(), {
    type: "err",
    error: "too short: ab",
  });
});

test("Parser.reject() rejects matching results", (t) => {
  const parser = Parser.reject(
    parseAny,
    (value) => value.length <= 2,
    (value) => `too short: ${value}`,
  );

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], "foo"],
  });

  t.deepEqual(parser(["ab", "bar"]).toJSON(), {
    type: "err",
    error: "too short: ab",
  });
});

test("Parser.zeroOrMore() parses zero or more occurrences", (t) => {
  const parser = Parser.zeroOrMore(parseFoo);

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], []],
  });
});

test("Parser.oneOrMore() parses one or more occurrences", (t) => {
  const parser = Parser.oneOrMore(parseFoo);

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.take() parses exact number of occurrences", (t) => {
  const parser = Parser.take(parseFoo, 2);

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });

  t.deepEqual(parser(["foo", "foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [
      ["foo", "bar"],
      ["foo", "foo"],
    ],
  });
});

test("Parser.takeBetween() parses within range", (t) => {
  const parser = Parser.takeBetween(parseFoo, 1, 3);

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });

  t.deepEqual(parser(["foo", "foo", "foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [
      ["foo", "bar"],
      ["foo", "foo", "foo"],
    ],
  });
});

test("Parser.takeAtLeast() parses at least n occurrences", (t) => {
  const parser = Parser.takeAtLeast(parseFoo, 2);

  t.deepEqual(parser(["foo", "foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo", "foo"]],
  });

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.takeAtMost() parses at most n occurrences", (t) => {
  const parser = Parser.takeAtMost(parseFoo, 2);

  t.deepEqual(parser(["foo", "foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [
      ["foo", "bar"],
      ["foo", "foo"],
    ],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], []],
  });
});

test("Parser.takeUntil() parses until condition", (t) => {
  const parser = Parser.takeUntil(parseAny, parseBar);

  t.deepEqual(parser(["foo", "baz", "bar", "qux"]).toJSON(), {
    type: "ok",
    value: [
      ["bar", "qux"],
      ["foo", "baz"],
    ],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], []],
  });
});

test("Parser.skip() ignores parse result", (t) => {
  const parser = Parser.skip(parseFoo);

  const [remainder, value] = parser(["foo", "bar"]).getUnsafe();

  t.deepEqual(remainder, ["bar"]);
  t.equal(value, undefined);
});

test("Parser.skipUntil() skips until delimiter", (t) => {
  const parser = Parser.skipUntil(parseAny, parseBar);

  const [remainder, value] = parser(["foo", "baz", "bar", "qux"]).getUnsafe();

  t.deepEqual(remainder, ["bar", "qux"]);
  t.equal(value, undefined);
});

test("Parser.peek() doesn't consume input", (t) => {
  const parser = Parser.peek(parseFoo);

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["foo", "bar"], "foo"],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.tee() calls callback on success", (t) => {
  let called = false;
  let callbackValue: string | undefined;

  const parser = Parser.tee(parseFoo, (value) => {
    called = true;
    callbackValue = value;
  });

  parser(["foo", "bar"]);
  t.equal(called, true);
  t.equal(callbackValue, "foo");

  called = false;
  parser(["bar"]);
  t.equal(called, false);
});

test("Parser.teeErr() calls callback on error", (t) => {
  let called = false;
  let callbackError: string | undefined;

  const parser = Parser.teeErr(parseFoo, (error) => {
    called = true;
    callbackError = error;
  });

  parser(["bar"]);
  t.equal(called, true);
  t.equal(callbackError, "invalid token: bar");

  called = false;
  parser(["foo", "bar"]);
  t.equal(called, false);
});

test("Parser.option() makes parser optional", (t) => {
  const parser = Parser.option(parseFoo);

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], { type: "some", value: "foo" }],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], { type: "none" }],
  });
});

test("Parser.either() tries parsers", (t) => {
  const parser = Parser.either(parseFoo, parseBar, parseBaz);

  t.deepEqual(parser(["foo", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], "foo"],
  });

  t.deepEqual(parser(["bar", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], "bar"],
  });

  t.deepEqual(parser(["baz", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], "baz"],
  });

  t.deepEqual(parser(["qux"]).toJSON(), {
    type: "err",
    error: "invalid token: qux",
  });
});

test("Parser.either() tries parsers in order", (t) => {
  const parser = Parser.either(
    parseFoo,
    Parser.map(parseAny, () => "any"),
  );

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], "foo"],
  });

  t.deepEqual(parser(["baz", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], "any"],
  });
});

test("Parser.exclusive() tries parsers", (t) => {
  const parseFooFoo = Parser.pair(parseFoo, parseFoo);
  const parseBarBar = Parser.pair(parseBar, parseBar);

  const parser = Parser.exclusive(parseAny, (token: string) =>
    token === "foo" ? parseFooFoo : parseBarBar,
  );

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  t.deepEqual(parser(["bar", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["bar", "bar"]],
  });

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });
});

test("Parser.exclusive() only tries one parser", (t) => {
  let foo = 0;
  let bar = 0;

  const parseFooFoo = Parser.teeErr(
    Parser.tee(Parser.pair(parseFoo, parseFoo), () => foo++),
    () => foo++,
  );
  const parseBarBar = Parser.teeErr(
    Parser.tee(Parser.pair(parseBar, parseBar), () => bar++),
    () => bar++,
  );

  const parser = Parser.exclusive(parseAny, (token: string) =>
    token === "foo" ? parseFooFoo : parseBarBar,
  );

  t.deepEqual(parser(["foo", "foo", "bar"]).toJSON(), {
    type: "ok",
    value: [["bar"], ["foo", "foo"]],
  });

  // FooFoo is triggered, BarBar is not, same behavior as either.
  t.equal(foo, 1);
  t.equal(bar, 0);

  t.deepEqual(parser(["bar", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["bar", "bar"]],
  });

  // BarBar is triggered, FooFoo is skipped, different from either.
  t.equal(foo, 1);
  t.equal(bar, 1);

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });

  // FooFoo is triggered and fails, BarBar is skipped, different from either.
  t.equal(foo, 2);
  t.equal(bar, 1);
});

test("Parser.pair() parses two values", (t) => {
  const parser = Parser.pair(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "bar"]],
  });

  t.deepEqual(parser(["foo", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: baz",
  });
});

test("Parser.left() returns left value, consumes right", (t) => {
  const parser = Parser.left(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], "foo"],
  });

  t.deepEqual(parser(["foo", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: baz",
  });
});

test("Parser.right() returns right value, consumes left", (t) => {
  const parser = Parser.right(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], "bar"],
  });

  t.deepEqual(parser(["foo", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: baz",
  });
});

test("Parser.delimited() parses value between delimiters", (t) => {
  const parser = Parser.delimited(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], "bar"],
  });

  const asymmetric = Parser.delimited(parseFoo, parseBar, parseBaz);
  t.deepEqual(asymmetric(["foo", "bar", "baz", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], "bar"],
  });
});

test("Parser.separated() parses two values with separator", (t) => {
  const parser = Parser.separated(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "foo"]],
  });

  const heterogeneous = Parser.separated(parseFoo, parseBar, parseBaz);
  t.deepEqual(heterogeneous(["foo", "bar", "baz", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], ["foo", "baz"]],
  });
});

test("Parser.separatedList() parses list with separators", (t) => {
  const parser = Parser.separatedList(parseFoo, parseBar);

  t.deepEqual(parser(["foo", "bar", "foo", "bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "foo", "foo"]],
  });

  t.deepEqual(parser(["foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo"]],
  });

  t.deepEqual(parser(["bar"]).toJSON(), {
    type: "err",
    error: "invalid token: bar",
  });

  const bounded = Parser.separatedList(parseFoo, parseBar, 2, 3);
  t.deepEqual(bounded(["foo", "baz"]).toJSON(), {
    type: "err",
    error: "invalid token: baz",
  });

  t.deepEqual(bounded(["foo", "bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "foo"]],
  });

  t.deepEqual(bounded(["foo", "bar", "foo", "bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "foo", "foo"]],
  });

  t.deepEqual(
    bounded(["foo", "bar", "foo", "bar", "foo", "bar", "foo", "baz"]).toJSON(),
    {
      type: "ok",
      value: [
        ["bar", "foo", "baz"],
        ["foo", "foo", "foo"],
      ],
    },
  );
});

test("Parser.array() parses sequence of parsers", (t) => {
  const parser = Parser.array<Input, [string, string, string], string>(
    noop,
    parseFoo,
    parseBar,
    parseBaz,
  );

  t.deepEqual(parser(["foo", "bar", "baz", "qux"]).toJSON(), {
    type: "ok",
    value: [["qux"], ["foo", "bar", "baz"]],
  });

  t.deepEqual(parser(["foo", "bar", "qux"]).toJSON(), {
    type: "err",
    error: "invalid token: qux",
  });
});

test("Parser.doubleBar() parses in any order", (t) => {
  const parser = Parser.doubleBar<Input, [string, string], string>(
    noop,
    parseFoo,
    parseBar,
  );

  t.deepEqual(parser(["foo", "bar", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "bar"]],
  });

  t.deepEqual(parser(["bar", "foo", "baz"]).toJSON(), {
    type: "ok",
    value: [["baz"], ["foo", "bar"]],
  });

  const [remainder1, [first1, second1]] = parser(["foo", "baz"]).getUnsafe();
  t.deepEqual(remainder1, ["baz"]);
  t.equal(first1, "foo");
  t.equal(second1, undefined);

  const [remainder2, [first2, second2]] = parser(["baz"]).getUnsafe();
  t.deepEqual(remainder2, ["baz"]);
  t.equal(first2, undefined);
  t.equal(second2, undefined);
});

test("Parser.end() checks for end of input", (t) => {
  const parser = Parser.end<Input, string>((token) => `unexpected: ${token}`);

  const result = parser([]);
  const [remainder, value] = result.getUnsafe();
  t.deepEqual(remainder, []);
  t.equal(value, undefined);

  t.deepEqual(parser(["foo"]).toJSON(), {
    type: "err",
    error: "unexpected: foo",
  });
});

test("Parser.final() ensures input is fully consumed", (t) => {
  const parser = Parser.final(parseFoo, (token) => `unexpected: ${token}`);

  t.deepEqual(parser(["foo"]).toJSON(), {
    type: "ok",
    value: [[], "foo"],
  });

  t.deepEqual(parser(["foo", "bar"]).toJSON(), {
    type: "err",
    error: "unexpected: bar",
  });
});
