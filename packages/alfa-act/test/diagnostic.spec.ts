import { describe, expect, it } from "vitest";

import { Diagnostic } from "../src";

describe("#of()", () => {
  it("trims whitespace of message", () => {
    const diag = Diagnostic.of("   foo   ");

    expect(diag.message).toBe("foo");
  });

  it("preserves casing", () => {
    expect(Diagnostic.of("Foo").message).toBe("Foo");
  });

  it("collapses adjacent whitespace into one", () => {
    expect(Diagnostic.of("foo   bar").message).toBe("foo bar");
  });
});
