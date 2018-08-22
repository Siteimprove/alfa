import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";
import { map } from "../src/map";

const n = BrowserSpecific.of(1, ["chrome"]);

const f: (n: number) => number = n => n * 2;

const g: (n: number) => number = n => n + 4;

test("Satifies the law of left identity", t => {
  t.deepEqual(map(n, f), BrowserSpecific.of(f(1), ["chrome"]));
});

test("Satifies the law of right identity", t => {
  t.deepEqual(map(n, n => BrowserSpecific.of(n, ["chrome"])), n);
});

test("Satifies the law of associativity", t => {
  const left = map(map(n, f), g);
  const right = map(n, n => map(f(n), g));

  t.deepEqual(left, right);
});
