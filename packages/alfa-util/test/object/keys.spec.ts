import { test } from "@siteimprove/alfa-test";
import { keys } from "../../src/object/keys";

test("Can extract the keys from an object", t => {
  const input = {
    a: true,
    b: false,
    c: {
      d: true
    }
  };

  t.deepEqual(keys(input), ["a", "b", "c"]);
});
