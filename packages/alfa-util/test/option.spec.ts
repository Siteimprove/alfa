import { test } from "@siteimprove/alfa-test";
import { none, option, some } from "../src/option";

test("Some only runs callback if parameter is something", t => {
  t.equal(some(4, (num: number) => "callback"), "callback");
  t.equal(some(null, (num: number) => "callback"), null);
});

test("None only runs callback if parameter is not something", t => {
  t.equal(none(4, () => "callback"), 4);
  t.equal(none(null, () => "callback"), "callback");
});

test("Options runs some if parameter is something, else none", t => {
  t.equal(
    option(4, (num: number) => "something", () => "nothing"),
    "something"
  );
  t.equal(
    option(null, (num: number) => "something", () => "nothing"),
    "nothing"
  );
});
