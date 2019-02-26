import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { every } from "../src/every";

test("Can run every on a set of browser branches", t => {
  const n = BrowserSpecific.of(1, ["chrome"])
    .branch(2, ["firefox"])
    .branch(4, ["safari"]);

  t(!every(n, t => t === 4));
  t(every(n, t => t < 8));
});
