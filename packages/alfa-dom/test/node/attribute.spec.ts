import { test } from "@siteimprove/alfa-test";

import { h } from "../../h";

test("#tokens() parses a space separated token list", (t) => {
  t.deepEqual([...h.attribute("foo", "foo").tokens()], ["foo"]);

  t.deepEqual([...h.attribute("foo", "foo bar").tokens()], ["foo", "bar"]);

  t.deepEqual([...h.attribute("foo", "").tokens()], []);

  t.deepEqual([...h.attribute("foo", "  \t").tokens()], []);

  t.deepEqual(
    [...h.attribute("foo", "foo  bar\tbaz").tokens()],
    ["foo", "bar", "baz"]
  );
});
