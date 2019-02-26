import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { isBrowserName, isBrowserSpecific } from "../src/guards";

test("isBrowserName returns true on valid browser names", t => {
  t(isBrowserName("chrome"));
  t(!isBrowserName("foo"));
});

test("isBrowserName returns true on valid browser names", t => {
  const n = BrowserSpecific.of(1, ["chrome"])
    .branch(2, ["firefox"])
    .branch(4, ["safari"]);

  t(isBrowserSpecific(n));
  t(!isBrowserSpecific("foo"));
});
