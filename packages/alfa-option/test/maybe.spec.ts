import { test } from "@siteimprove/alfa-test";

import { Maybe } from "../src/maybe";
import { None } from "../src/none";
import { Some } from "../src/some";

test("#toOption() of `None` returns the same instance", (t) => {
  const none = None;
  t.equal(Maybe.toOption(none), none);
});

test("#toOption() of `Some` returns the same instance", (t) => {
  const some = Some.of("foo");
  t.equal(Maybe.toOption(some), some);
});

test("#toOption() of `T` returns `Some<T>`", (t) => {
  const foo = "foo";
  t.deepEqual(Maybe.toOption(foo), Some.of(foo));
});
