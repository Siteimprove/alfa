import { test } from "@siteimprove/alfa-test";

import { Flags } from "../dist/flags.js";

const Example = Flags.named("example", "flagA", "flagB", "flagC", "flagD");

test(".allFlags is set correctly", (t) => {
  t.deepEqual(Example.allFlags, [
    Example.flagA,
    Example.flagB,
    Example.flagC,
    Example.flagD,
  ]);
});

test(".of() performs bitwise or of flags as numbers or names", (t) => {
  t.equal(Example.of(Example.flagA, Example.flagD).value, 9);

  t.equal(Example.of("flagB", "flagD").value, 10);

  t.equal(
    Example.of(Example.flagA, "flagC", Example.none, Example.flagD).value,
    13,
  );
});

test(".has() returns true for flags that are set", (t) => {
  const flags = Example.of(Example.flagA, Example.flagC, Example.flagD);

  for (const flag of [
    Example.flagA,
    Example.flagC,
    Example.flagD,
    "flagA",
    "flagC",
    "flagD",
    1,
    4,
    8,
  ] as const) {
    t.equal(flags.has(flag), true);
    t.equal(flags.isSet(flag), true);
  }

  for (const flag of [Example.flagB, "flagB", 2] as const) {
    t.equal(flags.has(flag), false);
    t.equal(flags.isSet(flag), false);
  }

  const none = Example.of(Example.none);

  for (const flag of [
    Example.flagA,
    Example.flagB,
    Example.flagC,
    Example.flagD,
    "flagA",
    "flagB",
    "flagC",
    "flagD",
    1,
    2,
    4,
    8,
  ] as const) {
    t.equal(none.has(flag), false);
    t.equal(none.isSet(flag), false);
  }
});

test(".has() returns false for 0 on non-empty flag sets", (t) => {
  for (const flag of [
    Example.of(Example.flagA),
    Example.of("flagB"),
    Example.of("flagA", "flagC"),
    Example.of("flagD"),
  ]) {
    t.deepEqual(flag.has(Example.none), false);
  }
});

test(".has() returns true for 0 on empty flag set", (t) => {
  t.deepEqual(Example.empty.has(Example.none), true);
});

test(".add and .remove behave as expected", (t) => {
  const none = Example.of(Example.none);

  const foo = none.add(Example.flagD).set("flagC", Example.flagB);

  for (const flag of [
    Example.flagB,
    Example.flagC,
    Example.flagD,
    "flagB",
    "flagC",
    "flagD",
  ] as const) {
    t.equal(foo.has(flag), true);
    t.equal(foo.isSet(flag), true);
  }

  for (const flag of [Example.flagA, "flagA"] as const) {
    t.equal(foo.has(flag), false);
    t.equal(foo.isSet(flag), false);
  }

  const bar = foo.remove(Example.flagA);

  for (const flag of [
    Example.flagB,
    Example.flagC,
    Example.flagD,
    "flagB",
    "flagC",
    "flagD",
  ] as const) {
    t.equal(bar.has(flag), true);
    t.equal(bar.isSet(flag), true);
  }

  for (const flag of [Example.flagA, "flagA"] as const) {
    t.equal(bar.has(flag), false);
    t.equal(bar.isSet(flag), false);
  }

  const baz = bar.unset(Example.flagD, "flagC");

  for (const flag of [Example.flagB, "flagB"] as const) {
    t.equal(baz.has(flag), true);
    t.equal(baz.isSet(flag), true);
  }

  for (const flag of [
    Example.flagA,
    Example.flagC,
    Example.flagD,
    "flagA",
    "flagC",
    "flagD",
  ] as const) {
    t.equal(baz.has(flag), false);
    t.equal(baz.isSet(flag), false);
  }
});

test("Non-flags are undefined", (t) => {
  // @ts-expect-error
  const undef = Example.flagE;
  t.equal(undef, undefined);

  const foo = Example.of();
  // @ts-expect-error
  const undef2 = foo.flagE;
  t.equal(undef2, undefined);
});

test("Only 8 flags are defined", (t) => {
  const TooManyFlags = Flags.named(
    "too many",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
  );
  t.equal(TooManyFlags.a, 1);
  t.equal(TooManyFlags.h, 128);

  // @ts-expect-error
  const undef = TooManyFlags.i;
  t.equal(undef, undefined);

  const foo = TooManyFlags.of(TooManyFlags.a, TooManyFlags.h);
  t.equal(foo.value, 129);
  // @ts-expect-error
  const undef2 = foo.i;
  t.equal(undef2, undefined);
});

test("Only the correct number of flags have values", (t) => {
  // @ts-expect-error
  const foo = Example.of("flagA", 16);
  t.equal(foo.value, 1);

  // @ts-expect-error
  const impossible = foo.has(32);
  t.equal(impossible, false);

  // @ts-expect-error
  const bar = foo.add(64);
  t.equal(bar.value, 1);
});

test("#is() returns true for sets that exactly match", (t) => {
  const actual = Example.of(Example.flagA, Example.flagC, Example.flagD);

  t.equal(actual.is("flagA", "flagC", "flagD"), true);

  for (const flags of [
    [Example.flagA],
    [Example.flagA, "flagC"],
    [Example.flagA, Example.flagB],
    [Example.flagA, "flagB", "flagC", Example.flagD],
  ] as const) {
    t.equal(actual.is(...flags), false);
  }
});

test("#toJSON() serialize the value and each flag", (t) => {
  t.deepEqual(
    Example.of(Example.flagA, Example.flagC, Example.flagD).toJSON(),
    {
      type: "flags",
      kind: "example",
      value: 13,
      flagA: true,
      flagB: false,
      flagC: true,
      flagD: true,
    },
  );
});
