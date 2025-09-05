import { describe, it } from "vitest";

import { Callback } from "../dist/callback.js";

describe("contraMap", () => {
  it("converts a callback T -> R to a callback U -> R using a mapper U -> T", ({
    expect,
  }) => {
    const fn = (callback: Callback<string, number>, input: string) =>
      callback(input);

    expect(
      fn(
        Callback.contraMap((x: number) => x * 2, Number),
        "5",
      ),
    ).toBe(10);
  });
});
