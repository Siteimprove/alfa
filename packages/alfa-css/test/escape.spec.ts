import { test } from "@siteimprove/alfa-test";
import { escape } from "../src/escape";

test("Can escape null character correctly", t => {
  t.equal(escape("\u0000"), "\ufffd");
});

test("Can escape bell character correctly", t => {
  t.equal(escape("\u0007"), `\\7 `);
});

test("Can escape delete character correctly", t => {
  t.equal(escape("\u007f"), `\\7f `);
});

test("Can escape 7 correctly", t => {
  t.equal(escape("7"), `\\37 `);
});

test("Can escape -7 correctly", t => {
  t.equal(escape("-7"), `-\\37 `);
});

test("Can escape - correctly", t => {
  t.equal(escape("-"), `\\-`);
});

test("Can escape a7A-_ correctly", t => {
  t.equal(escape("a7A-_"), "a7A-_");
});

test("Can escape @ correctly", t => {
  t.equal(escape("@"), `\\@`);
});
