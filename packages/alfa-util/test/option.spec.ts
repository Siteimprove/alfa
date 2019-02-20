import { test } from "@siteimprove/alfa-test";
import { Option } from "../src/option";

test("Option.ifSome only runs callback if parameter is something", t => {
  t.equal(Option.ifSome(4, n => n * 2), 8);
  t.equal(Option.ifSome(null, n => 2), null);
});

test("Option.ifNone only runs callback if parameter is not something", t => {
  t.equal(Option.ifNone(4, () => 2), 4);
  t.equal(Option.ifNone(null, () => 8), 8);
});

test("Option.map runs some if parameter is something, else none", t => {
  t.equal(Option.map(4, n => n * 2, () => 2), 8);
  t.equal(Option.map(null, n => n * 2, () => 8), 8);
});
