import { test } from "@siteimprove/alfa-test";

import { Err } from "../src/err";
import { Ok } from "../src/ok";
import { Result } from "../src/result";

const n: Result<number, string> = Ok.of(1);
const err: Result<number, string> = Err.of("error");

test("#map() applies a function to an ok value", (t) => {
  t.deepEqual(n.map((n) => n + 2).get(), 3);
});

test("#map() does nothing to an err value", (t) => {
  t.equal(
    err.map((n) => n + 2),
    err
  );
});

test(".from() constructs a result from a thunk", (t) => {
  const n = Result.from(() => 1);

  t.deepEqual(n.get(), 1);
});

test(".from() constructs a result from a thunk that throws", (t) => {
  const err = Result.from((): number => {
    throw "fail";
  });

  t.deepEqual(err.getErr(), "fail");
});

test(".from() constructs a result from an async thunk", async (t) => {
  const n = await Result.from(async () => 1);

  t.deepEqual(n.get(), 1);
});

test(".from() constructs a result from an async thunk that throws", async (t) => {
  const err = await Result.from(
    async (): Promise<number> => {
      throw "fail";
    }
  );

  t.deepEqual(err.getErr(), "fail");
});
