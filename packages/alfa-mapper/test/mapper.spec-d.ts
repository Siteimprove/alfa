import { describe, it, expectTypeOf } from "vitest";

import type { Mapper } from "../dist/mapper.d.ts";

describe("Mapper", () => {
  it("defaults to identity function with no extra args", () => {
    type MyMapper = Mapper<number>;
    const fn: MyMapper = (x) => x;
    expectTypeOf(fn).toEqualTypeOf<(value: number) => number>();
  });

  it("can change return type with second generic", () => {
    type MyMapper = Mapper<number, string>;
    const fn: MyMapper = (x) => x.toString();
    expectTypeOf(fn).toEqualTypeOf<(value: number) => string>();
  });

  it("can accept extra args with third generic", () => {
    type MyMapper = Mapper<number, string, [boolean, Date]>;
    const fn: MyMapper = (x, flag, date) =>
      flag ? date.toISOString() : x.toString();
    expectTypeOf(fn).toEqualTypeOf<
      (value: number, flag: boolean, date: Date) => string
    >();
  });
});
