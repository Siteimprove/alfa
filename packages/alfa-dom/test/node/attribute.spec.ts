import { None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Attribute } from "../../src";

const makeAttribute = (str: string) => Attribute.of(None, None, "dummy", str);

const tooShort = Err.of("too short");
const parser: Parser<string, number, string> = (str) =>
  str.length < 3 ? tooShort : Ok.of(["", str.length] as const);

test("parse attributes", (t) => {
  t.deepEqual((makeAttribute("12345").parse(parser)), Ok.of(5));
  t.deepEqual((makeAttribute("").parse(parser)), tooShort);
});

test("parse space separated token list", (t) => {
  t.deepEqual(makeAttribute("foo").tokens(), ["foo"]);
  t.deepEqual(makeAttribute("foo bar").tokens(), ["foo", "bar"]);
  t.deepEqual(makeAttribute("").tokens(), []);
  t.deepEqual(makeAttribute("  \t").tokens(), []);
  t.deepEqual(makeAttribute("foo  bar\tbaz").tokens(), ["foo", "bar", "baz"]);
});
