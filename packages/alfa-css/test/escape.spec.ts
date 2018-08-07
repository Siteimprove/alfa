import { Char } from "@siteimprove/alfa-lang";
import { test } from "@siteimprove/alfa-test";
import { escape } from "../src/escape";

const { fromCharCode } = String;

test("Can escape null character correctly", t => {
  t.equal(escape(fromCharCode(Char.Null)), "\ufffd");
});

test("Can escape bell character correctly", t => {
  t.equal(escape(fromCharCode(Char.Bell)), `\\${Char.Bell.toString(16)} `);
});

test("Can escape delete character correctly", t => {
  t.equal(escape(fromCharCode(Char.Delete)), `\\${Char.Delete.toString(16)} `);
});

test("Can escape 7 correctly", t => {
  t.equal(escape("7"), `\\${Char.DigitSeven.toString(16)} `);
});

test("Can escape -7 correctly", t => {
  t.equal(escape("-7"), `-\\${Char.DigitSeven.toString(16)} `);
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
