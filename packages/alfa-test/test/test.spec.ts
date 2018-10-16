import { fork } from "child_process";
import { test } from "../src/test";

test("Can test a failing block", t => {
  const sub = fork(`${__dirname}/helpers/failing.js`, [], { silent: true });
  const expected = `
Failing test
packages/alfa-test/test/helpers/failing.ts:4
`;

  sub.stderr.on("data", (data: Buffer) => {
    // do something with data
    t.equal(data.toString().startsWith(expected), true);
  });
});

test("Can test a passing block", t => {
  const sub = fork(`${__dirname}/helpers/passing.js`, [], { silent: true });
  const expected = ``;

  sub.stderr.on("data", (data: Buffer) => {
    // do something with data
    t.equal(data.toString(), expected);
  });
});

test("Can test a block throwing errors", t => {
  const sub = fork(`${__dirname}/helpers/error.js`, [], { silent: true });
  const expected = `Error: Foo
    at test_1.test.t`;

  sub.stderr.on("data", (data: Buffer) => {
    // do something with data
    t.equal(data.toString().startsWith(expected), true);
  });
});
