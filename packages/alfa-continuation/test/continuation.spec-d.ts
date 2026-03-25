import { describe, it, expectTypeOf } from "vitest";

import type { Continuation } from "../src/continuation.ts";

describe("Continuation", () => {
  it("defaults to a callback of a callback with no extra parameter", () => {
    type MyContinuation = Continuation<number>;
    const continuation: MyContinuation = (callback) => callback(42);

    expectTypeOf(continuation).toEqualTypeOf<
      (callback: (value: number) => void) => void
    >();
  });

  it("changes the return type of both callbacks with a second parameter", () => {
    type MyContinuation = Continuation<string, number>;
    const continuation: MyContinuation = (callback) => callback("hello");

    expectTypeOf(continuation).toEqualTypeOf<
      (callback: (value: string) => number) => number
    >();
  });

  it("adds extra arguments to the outer callback a with third parameter", () => {
    type MyContinuation = Continuation<string, string, [boolean, string]>;
    const continuation: MyContinuation = (callback, after, rest) =>
      after ? callback("hello" + rest) : callback(rest + "bar");

    expectTypeOf(continuation).toEqualTypeOf<
      (
        callback: (value: string) => string,
        after: boolean,
        rest: string,
      ) => string
    >();
  });
});
