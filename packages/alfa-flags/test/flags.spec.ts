import { test } from "@siteimprove/alfa-test";

import { Flags } from "../src/flags";

class Example extends Flags<Example.Flag> {
  public static of(...flags: Array<Example.Flag>): Example {
    return new Example(Flags._reduce(...flags));
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
    13
  );
});

test(".has() returns true for flags that are set", (t) => {
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

test(".add and .remove behave as expected", (t) => {
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
