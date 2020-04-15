import { Map } from "@siteimprove/alfa-map";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import {
  EnumeratedValueError,
  parseEnumeratedValue,
  parseTokensList,
} from "../../src/common/microsyntaxes";

const result = <T>(x: T) => Ok.of(["", x] as const);

test("parse enumerated value", (t) => {
  const mapping = Map.from([
    ["foo", 1],
    ["bar", 2],
  ]);
  const parser = parseEnumeratedValue(mapping);

  t.deepEqual(parser("foo"), result(1));
  t.deepEqual(parser("BaR"), result(2));
  t.deepEqual(parser("foobar"), Err.of(EnumeratedValueError.Invalid));
  t.deepEqual(parser(""), Err.of(EnumeratedValueError.Missing));
});

test("parse space separated token list", (t) => {
  t.deepEqual(parseTokensList("foo"), result(["foo"]));
  t.deepEqual(parseTokensList("foo bar"), result(["foo", "bar"]));
  t.deepEqual(parseTokensList(""), result([]));
  t.deepEqual(parseTokensList("  \t"), result([]));
  t.deepEqual(parseTokensList("foo  bar\tbaz"), result(["foo", "bar", "baz"]));
});
