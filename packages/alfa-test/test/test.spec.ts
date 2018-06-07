import { test } from "../src/test";

test("Does stuff", assert => {
  assert.deepEqual(
    {
      foo: "foo"
    },
    { foo: "bar" }
  );
});
