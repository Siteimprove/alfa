import { test } from "@siteimprove/alfa-test";

import { Err } from "../dist/err.js";
import { Ok } from "../dist/ok.js";
import { Result } from "../dist/result.js";

const n: Result<number, string> = Ok.of(1);
const err: Result<number, string> = Err.of("error");

test("#map() applies a function to an ok value", (t) => {
  t.deepEqual(n.map((n) => n + 2).getUnsafe(), 3);
});

test("#map() does nothing to an err value", (t) => {
  t.equal(
    err.map((n) => n + 2),
    err,
  );
});

test(".from() constructs a result from a thunk", (t) => {
  const n = Result.from(() => 1);

  t.deepEqual(n.getUnsafe(), 1);
});

test(".from() constructs a result from a thunk that throws", (t) => {
  const err = Result.from((): number => {
    throw "fail";
  });

  t.deepEqual(err.toJSON(), {
    type: "err",
    error: "fail",
  });
});

test(".from() constructs a result from an async thunk", async (t) => {
  const n = await Result.from(async () => 1);

  t.deepEqual(n.getUnsafe(), 1);
});

test(".from() constructs a result from an async thunk that throws", async (t) => {
  const err = await Result.from(async (): Promise<number> => {
    throw "fail";
  });

  t.deepEqual(err.toJSON(), {
    type: "err",
    error: "fail",
  });
});

test("#getOrElse() returns the ok value", (t) => {
  t.deepEqual(
    n.getOrElse(() => 2),
    1,
  );
});

test("#getOrElse() returns the thunk value on errors", (t) => {
  t.deepEqual(
    err.getOrElse(() => 2),
    2,
  );
});

test("#getOrElse() returns the callback value on errors", (t) => {
  t.deepEqual(
    err.getOrElse((msg) => msg.length),
    5,
  );
});

test("#getErrOrElse() returns the error value", (t) => {
  t.deepEqual(
    err.getErrOrElse(() => 2),
    "error",
  );
});

test("#getErrOrElse() returns the thunk value on oks", (t) => {
  t.deepEqual(
    n.getErrOrElse(() => 20),
    20,
  );
});

test("#getErrOrElse() returns the callback value on oks", (t) => {
  t.deepEqual(
    n.getErrOrElse((value) => value + 3),
    4,
  );
});
