import { describe, it, expectTypeOf } from "vitest";

import { Callback } from "../dist/callback.js";

describe("Callback", () => {
  it("defaults to void function with no extra args", () => {
    type MyCallback = Callback<number>;
    const fn: MyCallback = (x) => {
      console.log(x); // This won't actually be called since this is a type test.
    };
    expectTypeOf(fn).toEqualTypeOf<(value: number) => void>();
  });

  it("can change return type with second generic", () => {
    type MyCallback = Callback<number, string>;
    const fn: MyCallback = (x) => x.toString();
    expectTypeOf(fn).toEqualTypeOf<(value: number) => string>();
  });

  it("can accept extra args with third generic", () => {
    type MyCallback = Callback<number, string, [boolean, Date]>;
    const fn: MyCallback = (x, flag, date) =>
      flag ? date.toISOString() : x.toString();
    expectTypeOf(fn).toEqualTypeOf<
      (value: number, flag: boolean, date: Date) => string
    >();
  });
});
