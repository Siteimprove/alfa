import { None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Attribute } from "../../src";

const makeAttribute = (str: string) => Attribute.of(None, None, "dummy", str);

test("#tokens() parses a space separated token list", (t) => {
  t.deepEqual(makeAttribute("foo").tokens(), ["foo"]);
  t.deepEqual(makeAttribute("foo bar").tokens(), ["foo", "bar"]);
  t.deepEqual(makeAttribute("").tokens(), []);
  t.deepEqual(makeAttribute("  \t").tokens(), []);
  t.deepEqual(makeAttribute("foo  bar\tbaz").tokens(), ["foo", "bar", "baz"]);
});
