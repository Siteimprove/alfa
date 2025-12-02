import { test } from "@siteimprove/alfa-test";

import { Format } from "../../../dist/value/color/format.js";
import { Number, Percentage } from "../../../dist/index.js";

test(".resolve() clamps percentages to the 0-1 range", (t) => {
  t.deepEqual(
    Format.resolve(
      Percentage.of(0.2),
      Percentage.of(0.2),
      Percentage.of(0.2),
      Percentage.of(0.2),
    ),
    [
      Percentage.of(0.2),
      Percentage.of(0.2),
      Percentage.of(0.2),
      Percentage.of(0.2),
    ],
  );
});
