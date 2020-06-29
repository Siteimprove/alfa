import { test } from "@siteimprove/alfa-test";

import { None } from "@siteimprove/alfa-option";

import { Attribute } from "../../src/node/attribute";

const attribute = (value: string) => Attribute.of(None, None, "foo", value);

test("#tokens() parses a space separated token list", (t) => {
  t.deepEqual([...attribute("foo").tokens()], ["foo"]);
  t.deepEqual([...attribute("foo bar").tokens()], ["foo", "bar"]);
  t.deepEqual([...attribute("").tokens()], []);
  t.deepEqual([...attribute("  \t").tokens()], []);
  t.deepEqual([...attribute("foo  bar\tbaz").tokens()], ["foo", "bar", "baz"]);
});
