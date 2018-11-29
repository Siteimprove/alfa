import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { reduce } from "../src/reduce";

test("Can run every on a set of browser branches with initial value", t => {
  const n = BrowserSpecific.of(10, ["chrome"])
    .branch(11, ["firefox"])
    .branch(10, ["safari"]);

  const o = BrowserSpecific.of(10, ["chrome"])
    .branch(11, ["firefox"])
    .branch(12, ["safari"])
    .branch(9, ["ie"]);

  const expected = BrowserSpecific.of(3, ["chrome"])
    .branch(3, ["firefox"])
    .branch(3, ["safari"]);

  t.deepEqual(reduce([n, o], (acc, val) => acc + 1, 1), expected);
});

test("Can run every on a set of browser branches without initial value", t => {
  const n = BrowserSpecific.of(10, ["chrome"])
    .branch(11, ["firefox"])
    .branch(10, ["safari"]);

  const o = BrowserSpecific.of(10, ["chrome"])
    .branch(11, ["firefox"])
    .branch(12, ["safari"])
    .branch(9, ["ie"]);

  const expected = BrowserSpecific.of(11, ["chrome"])
    .branch(12, ["firefox"])
    .branch(11, ["safari"]);

  t.deepEqual(reduce([n, o], (acc, val) => acc + 1), expected);
});
