import { test } from "@siteimprove/alfa-test";
import { hasNameFrom } from "../src/has-name-from";
import * as Roles from "../src/roles";

test("Returns true, if label can have name from", t => {
  t.equal(hasNameFrom(Roles.Button, "contents"), true);
  t.equal(hasNameFrom(Roles.Button, "author"), true);
});

test("Returns false, if label cannot have name from", t => {
  t.equal(hasNameFrom(Roles.Section, "contents"), false);
  t.equal(hasNameFrom(Roles.Section, "author"), false);
});
