import { test } from "@siteimprove/alfa-test";

import { Time } from "../dist/time.js";

test(".of() contructs a time using the given epoch", (t) => {
  const time = Time.of(42);

  t.equal(time.epoch, 42);
});

test(".now() contructs a time using the current epoch", (t) => {
  const time = Time.now();

  // Accept a divergence of +-2ms from the current now.
  t(Math.abs(Date.now() - time.epoch) <= 2);
});

test("#elapsed() returns the time elapsed since epoch", (t) => {
  const time = Time.of(42);

  t.equal(time.elapsed(74), 32);
});
