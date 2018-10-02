import { test } from "@siteimprove/alfa-test";
import { isBetween } from "../src/is-between";

test("Returns true when character is between", t => {
  t.equal(
    isBetween("F".charCodeAt(0), "A".charCodeAt(0), "Z".charCodeAt(0)),
    true
  );
});

test("Returns false when character is not between", t => {
  t.equal(
    isBetween("F".charCodeAt(0), "a".charCodeAt(0), "z".charCodeAt(0)),
    false
  );
});
