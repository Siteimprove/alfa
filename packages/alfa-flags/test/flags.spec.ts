import { test } from "@siteimprove/alfa-test";

import { Flags } from "../dist/flags.js";

class Example extends Flags<"example", Example.Flag> {
  public static of(...flags: Array<Example.Flag>): Example {
    return new Example("example", Flags.reduce(...flags));
  }
}

namespace Example {
  export type Flag = 0 | 1 | 2 | 4 | 8;

  export const none = 0 as Flag;
  export const flagA = (1 << 0) as Flag;
  export const flagB = (1 << 1) as Flag;
  export const flagC = (1 << 2) as Flag;
  export const flagD = (1 << 3) as Flag;
}

test(".of() performs bitwise or of flags", (t) => {
  t.deepEqual(Example.of(Example.flagA, Example.flagD).value, 9);

  t.deepEqual(Example.of(Example.flagB, Example.flagD).value, 10);

  t.deepEqual(
    Example.of(Example.flagA, Example.flagC, Example.none, Example.flagD).value,
    13,
  );
});

test("#has() returns true for flags that are set", (t) => {
  const flags = Example.of(Example.flagA, Example.flagC, Example.flagD);

  for (const flag of [Example.flagA, Example.flagC, Example.flagD]) {
    t.deepEqual(flags.has(flag), true);
    t.deepEqual(flags.isSet(flag), true);
  }

  for (const flag of [Example.flagB]) {
    t.deepEqual(flags.has(flag), false);
    t.deepEqual(flags.isSet(flag), false);
  }

  const none = Example.of(Example.none);

  for (const flag of [
    Example.flagA,
    Example.flagB,
    Example.flagC,
    Example.flagD,
  ]) {
    t.deepEqual(none.has(flag), false);
    t.deepEqual(none.isSet(flag), false);
  }
});

test("#has() returns false for 0 on non-empty flag sets", (t) => {
  for (const flag of [
    Example.of(1),
    Example.of(2),
    Example.of(1, 4),
    Example.of(8),
  ]) {
    t.deepEqual(flag.has(Example.none), false);
  }
});

test("#has() returns true for 0 on empty flag set", (t) => {
  t.deepEqual(Example.of().has(Example.none), true);
});

test("#add and #remove behave as expected", (t) => {
  const none = Example.of(Example.none);

  const foo = none.add(Example.flagD).set(Example.flagC, Example.flagB);

  for (const flag of [Example.flagB, Example.flagC, Example.flagD]) {
    t.deepEqual(foo.has(flag), true);
    t.deepEqual(foo.isSet(flag), true);
  }

  for (const flag of [Example.flagA]) {
    t.deepEqual(foo.has(flag), false);
    t.deepEqual(foo.isSet(flag), false);
  }

  const bar = foo.remove(Example.flagA);

  for (const flag of [Example.flagB, Example.flagC, Example.flagD]) {
    t.deepEqual(bar.has(flag), true);
    t.deepEqual(bar.isSet(flag), true);
  }

  for (const flag of [Example.flagA]) {
    t.deepEqual(bar.has(flag), false);
    t.deepEqual(bar.isSet(flag), false);
  }

  const baz = bar.unset(Example.flagD, Example.flagC);

  for (const flag of [Example.flagB]) {
    t.deepEqual(baz.has(flag), true);
    t.deepEqual(baz.isSet(flag), true);
  }

  for (const flag of [Example.flagA, Example.flagC, Example.flagD]) {
    t.deepEqual(baz.has(flag), false);
    t.deepEqual(baz.isSet(flag), false);
  }
});

test("#is() returns true for sets that exactly match", (t) => {
  const actual = Example.of(Example.flagA, Example.flagC, Example.flagD);

  t.equal(actual.is(Example.flagA, Example.flagC, Example.flagD), true);

  for (const flags of [
    [Example.flagA],
    [Example.flagA, Example.flagC],
    [Example.flagA, Example.flagB],
    [Example.flagA, Example.flagB, Example.flagC, Example.flagD],
  ] as const) {
    t.equal(actual.is(...flags), false);
  }
});

test("#toJSON() serialize the value", (t) => {
  t.deepEqual(
    Example.of(Example.flagA, Example.flagC, Example.flagD).toJSON(),
    { type: "flags", kind: "example", value: 13 },
  );
});
