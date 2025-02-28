import { test } from "@siteimprove/alfa-test";

import { Flags } from "../dist/flags.js";

const Example = Flags.named("flagA", "flagB", "flagC", "flagD");

// test(".of() performs bitwise or of flags as numbers or names", (t) => {
//   t.deepEqual(Example.of(Example.flagA, Example.flagD).value, 9);
//
//   t.deepEqual(Example.of("flagB", "flagD").value, 10);
//
//   t.deepEqual(
//     Example.of(Example.flagA, "flagC", Example.none, Example.flagD).value,
//     13,
//   );
// });
//
// test(".has() returns true for flags that are set", (t) => {
//   const flags = Example.of(Example.flagA, Example.flagC, Example.flagD);
//
//   for (const flag of [
//     Example.flagA,
//     Example.flagC,
//     Example.flagD,
//     "flagA",
//     "flagC",
//     "flagD",
//   ] as const) {
//     t.deepEqual(flags.has(flag), true);
//     t.deepEqual(flags.isSet(flag), true);
//   }
//
//   for (const flag of [Example.flagB, "flagB"] as const) {
//     t.deepEqual(flags.has(flag), false);
//     t.deepEqual(flags.isSet(flag), false);
//   }
//
//   const none = Example.of(Example.none);
//
//   for (const flag of [
//     Example.flagA,
//     Example.flagB,
//     Example.flagC,
//     Example.flagD,
//     "flagA",
//     "flagB",
//     "flagC",
//     "flagD",
//   ] as const) {
//     t.deepEqual(none.has(flag), false);
//     t.deepEqual(none.isSet(flag), false);
//   }
// });
//
// test(".add and .remove behave as expected", (t) => {
//   const none = Example.of(Example.none);
//
//   const foo = none.add(Example.flagD).set("flagC", Example.flagB);
//
//   for (const flag of [
//     Example.flagB,
//     Example.flagC,
//     Example.flagD,
//     "flagB",
//     "flagC",
//     "flagD",
//   ] as const) {
//     t.deepEqual(foo.has(flag), true);
//     t.deepEqual(foo.isSet(flag), true);
//   }
//
//   for (const flag of [Example.flagA, "flagA"] as const) {
//     t.deepEqual(foo.has(flag), false);
//     t.deepEqual(foo.isSet(flag), false);
//   }
//
//   const bar = foo.remove(Example.flagA);
//
//   for (const flag of [
//     Example.flagB,
//     Example.flagC,
//     Example.flagD,
//     "flagB",
//     "flagC",
//     "flagD",
//   ] as const) {
//     t.deepEqual(bar.has(flag), true);
//     t.deepEqual(bar.isSet(flag), true);
//   }
//
//   for (const flag of [Example.flagA, "flagA"] as const) {
//     t.deepEqual(bar.has(flag), false);
//     t.deepEqual(bar.isSet(flag), false);
//   }
//
//   const baz = bar.unset(Example.flagD, "flagC");
//
//   for (const flag of [Example.flagB, "flagB"] as const) {
//     t.deepEqual(baz.has(flag), true);
//     t.deepEqual(baz.isSet(flag), true);
//   }
//
//   for (const flag of [
//     Example.flagA,
//     Example.flagC,
//     Example.flagD,
//     "flagA",
//     "flagC",
//     "flagD",
//   ] as const) {
//     t.deepEqual(baz.has(flag), false);
//     t.deepEqual(baz.isSet(flag), false);
//   }
// });
//
// test("Non-flags are undefined", (t) => {
//   // @ts-expect-error
//   const undef = Example.flagE;
//   t.equal(undef, undefined);
//
//   const foo = Example.of();
//   // @ts-expect-error
//   const undef2 = foo.flagE;
//   t.equal(undef2, undefined);
// });
//
// test("Only 8 flags are defined", (t) => {
//   const TooManyFlags = Flags.named(
//     "a",
//     "b",
//     "c",
//     "d",
//     "e",
//     "f",
//     "g",
//     "h",
//     "i",
//     "j",
//   );
//   t.equal(TooManyFlags.a, 1);
//   t.equal(TooManyFlags.h, 128);
//
//   // @ts-expect-error
//   const undef = TooManyFlags.i;
//   t.equal(undef, undefined);
//
//   const foo = TooManyFlags.of(TooManyFlags.a, TooManyFlags.h);
//   t.equal(foo.value, 129);
//   // @ts-expect-error
//   const undef2 = foo.i;
//   t.equal(undef2, undefined);
// });

test("Only the correct number of flags have values", (t) => {
  // @ts-expect-error
  const foo = Example.of(16);
  t.equal(foo.value, 0);

  // @ts-expect-error
  const impossible = foo.has(32);
  t.equal(impossible, false);

  // @ts-expect-error
  const bar = foo.add(64);
  t.equal(bar.value, 0);
});
