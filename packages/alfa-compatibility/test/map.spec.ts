import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { map } from "../src/map";

test("Can map a set of browser branches", t => {
  const n = BrowserSpecific.of(1, ["chrome"])
    .branch(2, ["firefox"])
    .branch(4, ["safari"]);
  const f: (n: number) => number = n => n * 2;
  t.deepEqual(
    map(n, f),
    BrowserSpecific.of(2, ["chrome"])
      .branch(4, ["firefox"])
      .branch(8, ["safari"])
  );
});
