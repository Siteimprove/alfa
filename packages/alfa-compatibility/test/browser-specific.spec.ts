import { test } from "@siteimprove/alfa-test";
import { BrowserSpecific } from "../src/browser-specific";

const { map } = BrowserSpecific;

const n = BrowserSpecific.of(1, ["chrome"]).branch(2, ["firefox"]);

const f: (n: number) => number = n => n * 2;

const g: (n: number) => number = n => n + 4;

test("Satisfies the law of left identity", t => {
  t.deepEqual(
    map(n, f),
    BrowserSpecific.of(f(1), ["chrome"]).branch(f(2), ["firefox"])
  );
});

test("Satisfies the law of right identity", t => {
  t.deepEqual(
    map(n, n => BrowserSpecific.of(n, ["chrome"]).branch(n, ["firefox"])),
    n
  );
});

test("Satisfies the law of associativity", t => {
  const left = map(map(n, f), g);
  const right = map(n, n => map(f(n), g));

  t.deepEqual(left, right);
});

test("Perform binary operations on browser specific values", t => {
  // using a non-commutative operation
  const sub = BrowserSpecific.Iterable.binOp((x: number, y: number) => x - y);

  const m = BrowserSpecific.of(3, ["chrome"]).branch(4, ["firefox"]);
  const p = BrowserSpecific.of(1, ["chrome"]).branch(0, ["firefox"]);
  const q = BrowserSpecific.of(2, ["chrome"]).branch(2, ["firefox"]);

  t.equal(sub(5, 3), 2);
  t.deepEqual(sub(2, n), p);
  t.deepEqual(sub(m, 2), n);
  t.deepEqual(sub(m, n), q);
});
