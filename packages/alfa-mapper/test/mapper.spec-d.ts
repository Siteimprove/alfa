import { describe, it, expectTypeOf } from "vitest";

import type { Mapper } from "../src/mapper.ts";

describe("Mapper", () => {
  it("defaults to identity function with no extra args", () => {
    expectTypeOf<Mapper<number>>().toEqualTypeOf<(value: number) => number>();
  });

  it("can change return type with second generic", () => {
    expectTypeOf<Mapper<number, string>>().toEqualTypeOf<
      (value: number) => string
    >();
  });

  it("can accept extra args with third generic", () => {
    expectTypeOf<Mapper<number, string, [boolean, Date]>>().toEqualTypeOf<
      (value: number, flag: boolean, date: Date) => string
    >();
  });
});
