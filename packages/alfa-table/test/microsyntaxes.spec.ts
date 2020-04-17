import { Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import {
  parseSignedInteger,
  parseNonNegativeInteger,
  Outcomes,
} from "../src/microsyntaxes";

const result = <T>(x: T) => Ok.of(x);

test("parseInteger() parses integers according to specs", (t) => {
  t.deepEqual(parseSignedInteger("2"), result(2));
  t.deepEqual(parseSignedInteger("+1234"), result(1234));
  t.deepEqual(parseSignedInteger("-5678"), result(-5678));
  t.deepEqual(parseSignedInteger("-0"), result(0));
  t.deepEqual(parseSignedInteger("    14"), result(14));

  t.deepEqual(parseSignedInteger("touan"), Outcomes.notNumber);
  t.deepEqual(parseSignedInteger("12snr"), result(12));
  t.deepEqual(parseSignedInteger("1.2"), result(1));

  t.deepEqual(parseSignedInteger(""), Outcomes.notNumber);
  t.deepEqual(parseSignedInteger("    "), Outcomes.notNumber);
});

test("parseNonNegativeInteger() parses non-negative integers according to specs", (t) => {
  t.deepEqual(parseNonNegativeInteger("42"), result(42));
  t.deepEqual(parseNonNegativeInteger("-0"), result(0));
  t.deepEqual(parseNonNegativeInteger("-42"), Outcomes.negative);
});
