import { test } from "@siteimprove/alfa-test";

import { None } from "../dist/none.js";
import { Option } from "../dist/option.js";
import { Some } from "../dist/some.js";

const n: Option<number> = Some.of(1);
const m: Option<number> = None;

test("#map() applies a function to a non-empty value", (t) => {
  t.deepEqual(
    n.map((n) => n + 2),
    Some.of(3),
  );
});

test("#map() does not apply a function to an empty value", (t) => {
  t.equal(
    m.map((n) => n + 2),
    None,
  );
});

test("#flatMap() satisfies left identity", (t) => {
  const value = 1;
  const option = Some.of(value);
  const f = (n: number) => Some.of(n + 2);

  t.deepEqual(option.flatMap(f), f(value));
});

test("#flatMap() satisfies right identity", (t) => {
  const option = Some.of(1);

  t.deepEqual(
    option.flatMap((n) => Some.of(n)),
    option,
  );
});

test("#flatMap() satisfies associativity", (t) => {
  const option = Some.of(1);
  const f = (n: number) => Some.of(n + 2);
  const g = (n: number) => Some.of(n * 3);

  t.deepEqual(
    option.flatMap(f).flatMap(g),
    option.flatMap((n) => f(n).flatMap(g)),
  );
});

test("#flatten() unwraps a nested option", (t) => {
  t.deepEqual(Option.of(Option.of(1)).flatten(), Some.of(1));
});
