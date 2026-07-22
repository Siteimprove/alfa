import { describe, it, expectTypeOf } from "vitest";

import type { Continuation } from "../src/continuation.ts";

describe("Continuation", () => {
  it("defaults to a callback of a callback with no extra parameter", () => {
    expectTypeOf<Continuation<number>>().toEqualTypeOf<
      (callback: (value: number) => void) => void
    >();
  });

  it("changes the return type of both callbacks with a second parameter", () => {
    expectTypeOf<Continuation<string, number>>().toEqualTypeOf<
      (callback: (value: string) => number) => number
    >();
  });

  it("adds extra arguments to the outer callback a with third parameter", () => {
    expectTypeOf<
      Continuation<string, string, [boolean, string]>
    >().toEqualTypeOf<
      (
        callback: (value: string) => string,
        after: boolean,
        rest: string,
      ) => string
    >();
  });
});
