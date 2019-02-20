import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { some } from "../src/some";

test("Can run some on a set of browser branches", t => {
  const n = BrowserSpecific.of(1, ["chrome"])
    .branch(2, ["firefox"])
    .branch(4, ["safari"]);

  t(some(n, t => t === 4));
  t(!some(n, t => t === 8));
});
