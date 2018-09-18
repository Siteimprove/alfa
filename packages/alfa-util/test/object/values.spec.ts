import { test } from "@siteimprove/alfa-test";
import { values } from "../../src/object/values";

test("Can extract the values from an object", t => {
  const input = {
    a: 4,
    b: false,
    c: {
      d: true
    }
  };

  t.deepEqual(values(input), [4, false, { d: true }]);
});
