import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";

const { map } = BrowserSpecific;

const n = BrowserSpecific.of(1, ["chrome"]).branch(2, ["firefox"]);

const f: (n: number) => number = n => n * 2;

const g: (n: number) => number = n => n + 4;

test("map() satisfies the law of left identity", t => {
  t.deepEqual(
    map(n, f),
    BrowserSpecific.of(f(1), ["chrome"]).branch(f(2), ["firefox"])
  );
});

test("map() satisfies the law of right identity", t => {
  t.deepEqual(
    map(n, n => BrowserSpecific.of(n, ["chrome"]).branch(n, ["firefox"])),
    n
  );
});

test("map() satisfies the law of associativity", t => {
  const left = map(map(n, f), g);
  const right = map(n, n => map(f(n), g));

  t.deepEqual(left, right);
});
