import { Notifier, test } from "../src/test";

test("Can test a failing block", async t => {
  const notifier: Notifier = {
    error: message => {
      t(message.indexOf("Input A expected to strictly equal input B") !== -1);
    }
  };

  await test(
    "Failing test",
    t => {
      t.equal(true, false);
    },
    notifier
  );
});

test("Can test a passing block", async t => {
  const notifier: Notifier = {
    error: message => {
      t("", message);
    }
  };

  await test(
    "Passing test",
    t => {
      t.equal(true, true);
    },
    notifier
  );
});

test("Can test a block throwing errors", async t => {
  const notifier: Notifier = {
    error: message => {
      t(message.indexOf("Error: You shall not pass") !== -1);
    }
  };

  await test(
    "Erroring test",
    t => {
      throw Error("You shall not pass");
    },
    notifier
  );
});
