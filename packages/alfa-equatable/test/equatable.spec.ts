import { test } from "@siteimprove/alfa-test";

import { Equatable } from "../src";

const value = <T>(value: T) => {
  const self = {
    value,
    equals(value: any): boolean {
      return value === self.value || value.value === self.value;
    },
  };

  return self;
};

test(".equals() tests if two numbers are equal", (t) => {
  t.equal(Equatable.equals(1, 1), true);
  t.equal(Equatable.equals(1, 2), false);
  t.equal(Equatable.equals(2, 1), false);
});

test(".equals() tests if two strings are equal", (t) => {
  t.equal(Equatable.equals("foo", "foo"), true);
  t.equal(Equatable.equals("foo", "bar"), false);
  t.equal(Equatable.equals("bar", "foo"), false);
});

test(".equals() tests if NaN is equal to NaN", (t) => {
  t.equal(Equatable.equals(NaN, NaN), true);
  t.equal(Equatable.equals(NaN, 1), false);
  t.equal(Equatable.equals(1, NaN), false);
});

test(".equals() tests if two booleans are equal", (t) => {
  t.equal(Equatable.equals(true, true), true);
  t.equal(Equatable.equals(true, false), false);
  t.equal(Equatable.equals(false, true), false);
});

test(".equals() test if two equatable values are equal", (t) => {
  t.equal(Equatable.equals(value(1), value(1)), true);
  t.equal(Equatable.equals(value(1), 1), true);
  t.equal(Equatable.equals(1, value(1)), true);

  t.equal(Equatable.equals(value(1), value(2)), false);
  t.equal(Equatable.equals(value(1), 2), false);
  t.equal(Equatable.equals(2, value(1)), false);
});
