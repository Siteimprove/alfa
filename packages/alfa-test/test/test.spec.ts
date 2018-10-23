import { Notifier, test } from "../src/test";

test("Can test a failing block", t => {
  const notifier: Notifier = {
    error: message => {
      t(message.indexOf("Input A expected to strictly equal input B") !== -1);
    }
  };

  test(
    "Failing test",
    t => {
      t.equal(true, false);
    },
    notifier
  );
});

test("Can test a passing block", t => {
  const notifier: Notifier = {
    error: message => {
      t("", message);
    }
  };

  test(
    "Passing test",
    t => {
      t.equal(true, true);
    },
    notifier
  );
});

test("Can test a block throwing errors", t => {
  const notifier: Notifier = {
    error: message => {
      t("", message);
    }
  };

  test(
    "Erroring test",
    t => {
      throw Error("You shall not pass");
    },
    notifier
  );
});
