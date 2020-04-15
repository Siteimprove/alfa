import { Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import {
  parseInteger,
  parseNonNegativeInteger,
  Outcomes,
} from "../src/microsyntaxes";

const result = <T>(x: T) => Ok.of(x);

test("parse integers", (t) => {
  t.deepEqual(parseInteger("2"), result(2));
  t.deepEqual(parseInteger("1234"), result(1234));
  t.deepEqual(parseInteger("-5678"), result(-5678));
  t.deepEqual(parseInteger("-0"), result(0));
  t.deepEqual(parseInteger("    14"), result(14));

  t.deepEqual(parseInteger("touan"), Outcomes.notNumber);
  t.deepEqual(parseInteger("12snr"), Outcomes.notNumber);
  t.deepEqual(parseInteger("1.2"), Outcomes.notInteger);

  t.deepEqual(parseInteger(""), Outcomes.empty);
  t.deepEqual(parseInteger("    "), Outcomes.empty);
});

test("parse non-negative integers", (t) => {
  t.deepEqual(parseNonNegativeInteger("42"), result(42));
  t.deepEqual(parseNonNegativeInteger("-0"), result(0));
  t.deepEqual(parseNonNegativeInteger("-42"), Outcomes.negative);
});
