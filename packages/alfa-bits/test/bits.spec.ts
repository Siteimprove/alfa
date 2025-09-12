import { describe, it } from "vitest";

import { Bits } from "../dist/bits.js";

describe("#bit()", () => {
  it("returns a number whose binary representation has a 1 in the ith position", ({
    expect,
  }) => expect(Bits.bit(3)).toBe(0b1000));
});

describe("#set()", () => {
  it("returns the input with the ith bit set to 1", ({ expect }) =>
    expect(Bits.set(0b1000, 2)).toBe(0b1100));
});

describe("#clear()", () => {
  it("returns the input with the ith bit set to 0", ({ expect }) =>
    expect(Bits.clear(0b1100, 2)).toBe(0b1000));
});

describe("#test()", () => {
  it("returns true if the ith bit is 1", ({ expect }) =>
    expect(Bits.test(0b1100, 2)).toBe(true));

  it("returns false if the ith bit is 0", ({ expect }) =>
    expect(Bits.test(0b1000, 2)).toBe(false));
});

describe("#take()", () => {
  it("keeps only the i least signifant bits", ({ expect }) =>
    expect(Bits.take(0b1111, 3)).toBe(0b111));
});

describe("#skip()", () => {
  it("removes the i least signifant bits", ({ expect }) =>
    expect(Bits.skip(0b1111, 3)).toBe(0b1));
});

describe("#popCount()", () => {
  it("counts the number of 1s", ({ expect }) =>
    expect(Bits.popCount(0b1011)).toBe(3));
});
