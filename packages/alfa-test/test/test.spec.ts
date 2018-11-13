import { test } from "../src/test";

test("Can test a failing block", async t => {
  let failed = false;

  await test(
    "Failing test",
    t => {
      t.equal(true, false);
    },
    {
      error: message => {
        failed = true;
      }
    }
  );

  t(failed);
});

test("Can test a passing block", async t => {
  let passed = true;

  await test(
    "Passing test",
    t => {
      t.equal(true, true);
    },
    {
      error: message => {
        passed = false;
      }
    }
  );

  t(passed);
});

test("Can test a block throwing errors", async t => {
  let failed = false;

  await test(
    "Erroring test",
    t => {
      throw Error("You shall not pass");
    },
    {
      error: message => {
        failed = true;
      }
    }
  );

  t(failed);
});
