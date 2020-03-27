import { Map } from "@siteimprove/alfa-map";
import { None, Some } from "@siteimprove/alfa-option";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import {
  enumError,
  parseEnumeratedValue,
  parseInteger,
  parseNonNegativeInteger,
} from "../../src/tables/helpers";

const empty = Err.of("The string is empty");
const notNumber = Err.of("The string does not represent a number");
const notInteger = Err.of("The string does not represent an integer");
const negative = Err.of("This is a negative number");
const result = (x: any) => Ok.of(["", x] as const);

test("parse integers", (t) => {
  t.deepEqual(parseInteger("2"), result(2));
  t.deepEqual(parseInteger("1234"), result(1234));
  t.deepEqual(parseInteger("-5678"), result(-5678));
  t.deepEqual(parseInteger("-0"), result(0));
  t.deepEqual(parseInteger("    14"), result(14));

  t.deepEqual(parseInteger("touan"), notNumber);
  t.deepEqual(parseInteger("12snr"), notNumber);
  t.deepEqual(parseInteger("1.2"), notInteger);

  t.deepEqual(parseInteger(""), empty);
  t.deepEqual(parseInteger("    "), empty);
});

test("parse non-negative integers", (t) => {
  t.deepEqual(parseNonNegativeInteger("42"), result(42));
  t.deepEqual(parseNonNegativeInteger("-0"), result(0));
  t.deepEqual(parseNonNegativeInteger("-42"), negative);
});

test("parse enumerated attribute", (t) => {
  const mapping = Map.from([
    ["foo", 1],
    ["bar", 2],
  ]);
  const parser = parseEnumeratedValue(mapping);

  t.deepEqual(parser("foo"), result(1));
  t.deepEqual(parser("BaR"), result(2));
  t.deepEqual(parser("foobar"), Err.of<enumError>("invalid"));
  t.deepEqual(parser(""), Err.of<enumError>("missing"));
});
