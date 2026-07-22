import { describe, it, expectTypeOf } from "vitest";

import { Callback } from "../src/callback.ts";

describe("Callback", () => {
  it("defaults to void function with no extra args", () => {
    expectTypeOf<Callback<number>>().toEqualTypeOf<(value: number) => void>();
  });

  it("can change return type with second generic", () => {
    expectTypeOf<Callback<number, string>>().toEqualTypeOf<
      (value: number) => string
    >();
  });

  it("can accept extra args with third generic", () => {
    expectTypeOf<Callback<number, string, [boolean, Date]>>().toEqualTypeOf<
      (value: number, flag: boolean, date: Date) => string
    >();
  });
});
