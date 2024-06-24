import { describe, expect, it } from "vitest";

import { Audit } from "../src";

describe("#evaluate()", () => {
  it("returns empty result when input is null and rules list is empty", async () => {
    const audit = Audit.of(null, []);

    const result = await audit.evaluate();

    expect([...result]).toEqual([]);
  });
});
