import { test } from "@siteimprove/alfa-test";

import { Flag } from "../src/flag";

test(".default() constructs a flag with a default value", (t) => {
  const flag = Flag.string("foo", "").default("hello");

  // When parsed without arguments, the value should be equal to the default
  // value.
  let [, { value }] = flag.parse([]).get();
  t.equal(value, "hello");

  // When parsed with valid arguments, the default value should not be applied.
  [, { value }] = flag.parse(["--foo", "world"]).get();
  t.equal(value, "world");
});

test(".optional() constructs an optional flag", (t) => {
  const flag = Flag.string("foo", "").optional();

  // When parsed without arguments, the value should be `None` as the flag is
  // optional.
  let [argv, set] = flag.parse([]).get();
  t.equal(set.value.isNone(), true);

  // When parsed with valid arguments, the value should be wrapped in `Option`.
  [argv, set] = flag.parse(["--foo", "hello"]).get();
  t.deepEqual(set.value.get(), "hello");
});

test(".repeatable() constructs a repeatable flag", (t) => {
  const flag = Flag.string("foo", "").repeatable();

  let [argv, set] = flag.parse(["--foo", "hello", "--foo", "world"]).get();
  t.deepEqual(set.value, ["hello"]);

  // When parsing the flag the second time, the second value should be combined
  // with the first value.
  [argv, set] = set.parse(argv).get();
  t.deepEqual(set.value, ["hello", "world"]);

  // When parsing the flag the third time, an error should be returned as there
  // are no more arguments left.
  t.equal(set.parse(argv).getErr(), "Missing flag");
});

test(".repeatable().optional() constructs a repeatable, optional flag", (t) => {
  const flag = Flag.string("foo", "").repeatable().optional();

  // When parsed without arguments, the value should be `None` as the flag is
  // optional.
  let [argv, set] = flag.parse([]).get();
  t.equal(set.value.isNone(), true);

  // When parsed with valid arguments, the value be wrapped in `Option`.
  [argv, set] = flag.parse(["--foo", "hello", "--foo", "world"]).get();
  t.deepEqual(set.value.get(), ["hello"]);

  // When parsing the flag the second time, the second value should be combined
  // with the first value and wrapped in `Option`.
  [argv, set] = set.parse(argv).get();
  t.deepEqual(set.value.get(), ["hello", "world"]);

  // When parsing the flag the third time, the value should remain the same as
  // there are no more arguments left. As the flag is optional, this does not
  // cause an error.
  [argv, set] = set.parse(argv).get();
  t.deepEqual(set.value.get(), ["hello", "world"]);
});

test(".repeatable().default() constructs a repeatable flag with a default value", (t) => {
  const flag = Flag.string("foo", "").repeatable().default(["default"]);

  // When parsed without arguments, the value should be equal to the default
  // value.
  let [argv, set] = flag.parse([]).get();
  t.deepEqual(set.value, ["default"]);

  // When parsed with valid arguments, the default value should not be applied.
  [argv, set] = flag.parse(["--foo", "hello", "--foo", "world"]).get();
  t.deepEqual(set.value, ["hello"]);

  // When parsing the flag the second time, the second value should be combined
  // with the first value.
  [argv, set] = set.parse(argv).get();
  t.deepEqual(set.value, ["hello", "world"]);

  // When parsing the flag the third time, the value should remain the same as
  // there are no more arguments left. As the flag has a default value, this
  // does not cause an error.
  [argv, set] = set.parse(argv).get();
  t.deepEqual(set.value, ["hello", "world"]);
});

test(".negatable() constructs a negatable flag", (t) => {
  const flag = Flag.string("foo", "").negatable((arg) => arg.toUpperCase());

  let [, { value }] = flag.parse(["--foo", "hello"]).get();
  t.equal(value, "hello");

  [, { value }] = flag.parse(["--no-foo", "hello"]).get();
  t.equal(value, "HELLO");
});
