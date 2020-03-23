import { test } from "@siteimprove/alfa-test";

import { Record } from "../src/record";

test(".of() constructs a record from a set of properties", (t) => {
  const record = Record.of({ foo: "foo", bar: 1 });

  t.deepEqual(
    [...record],
    [
      ["bar", 1],
      ["foo", "foo"],
    ]
  );
});

test("#has() returns true if a record has a given key", (t) => {
  const record = Record.of({ foo: 42 });

  t(record.has("foo"));
});

test("#has() returns false if a record does not have a given key", (t) => {
  const record = Record.of({ foo: 42 });

  t(!record.has("bar"));
});

test("#get() gets the value of a key of a record", (t) => {
  const record = Record.of({ foo: 42 });

  t.deepEqual(record.get("foo").get(), 42);
});

test("#get() returns none if a record does not have a given key", (t) => {
  const record = Record.of<{ [key: string]: number }>({ foo: 42 });

  t(record.get("bar").isNone());
});

test("#set() sets the value of a key of a record", (t) => {
  const record = Record.of({ foo: 42 }).set("foo", 12);

  t.deepEqual(record.get("foo").get(), 12);
});

test("#set() does nothing when setting the value of a key that doesn't exists", (t) => {
  const record = Record.of<{ [key: string]: number }>({ foo: 42 });

  t.equal(record.set("bar", 12), record);
});
