import { test } from "../src/test";
import { foo } from "./foo";

test("foo", t => {
  foo("foo");
});
