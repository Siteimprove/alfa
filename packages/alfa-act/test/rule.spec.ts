import { describe, it } from "vitest";

import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Err, Ok } from "@siteimprove/alfa-result";

import { Diagnostic, Rule } from "../src";

class NumberWrapper implements Hashable {
  constructor(public value: number) {}
  hash(hash: Hash): void {
    hash.writeNumber(this.value);
  }
}

const dummyRule = Rule.Atomic.of<Array<NumberWrapper>, NumberWrapper>({
  uri: "positive numbers must be even",
  evaluate(numbers) {
    return {
      applicability() {
        return numbers.filter((n) => n.value >= 0);
      },

      expectations(target) {
        const result =
          target.value % 2 === 0
            ? Ok.of(Diagnostic.of("Number was even"))
            : Err.of(Diagnostic.of("Number was not even"));
        return {
          1: result,
        };
      },
    };
  },
});

describe("#evaluate()", () => {
  it("matches snapshot", async (ctx) => {
    const result = await dummyRule.evaluate([
      new NumberWrapper(-3),
      new NumberWrapper(-2),
      new NumberWrapper(0),
      new NumberWrapper(2),
      new NumberWrapper(3),
      new NumberWrapper(3.1415),
    ]);

    ctx.expect(result).toMatchSnapshot();
  });
});
