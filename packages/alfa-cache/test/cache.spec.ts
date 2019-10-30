import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { Cache } from "../src/cache";

const cache = Cache.from([["foo", 1], ["bar", 2]], Cache.Type.Strong);

test("get() returns some when getting a value that does exist", t => {
  t.deepEqual(cache.get("foo"), Some.of(1));
});

test("get() returns none when getting a value that does not exist", t => {
  t.equal(cache.get("baz"), None);
});
