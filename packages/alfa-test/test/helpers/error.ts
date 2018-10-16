import { test } from "../../src/test";

test("Erroring test", t => {
  throw Error("Foo");
});
