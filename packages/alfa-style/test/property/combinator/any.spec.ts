import { test } from "@siteimprove/alfa-test";

import { Result, Err } from "@siteimprove/alfa-result";

import { any } from "../../../src/property/combinator/any";

test(`any() constructs a parser that matches one or more of the passed parsers,
      in any order`, (t) => {
  const parse = any<string, string, string>(
    (input) =>
      input.startsWith("foo")
        ? Result.of([input.slice(3), "foo"])
        : Err.of("No foo!"),

    (input) =>
      input.startsWith("bar")
        ? Result.of([input.slice(3), "bar"])
        : Err.of("No bar!")
  );

  t.deepEqual(parse("foo").get(), ["", ["foo"]]);

  t.deepEqual(parse("foobar").get(), ["", ["foo", "bar"]]);

  t.deepEqual(parse("barfoo").get(), ["", ["bar", "foo"]]);

  t.deepEqual(parse("barfoofoo").get(), ["foo", ["bar", "foo"]]);

  t.deepEqual(parse("").getErr(), "No foo!");
});
