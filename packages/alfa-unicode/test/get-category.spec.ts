import { test } from "@siteimprove/alfa-test";
import { getCategory } from "../src/get-category";
import { Category } from "../src/types";

function code(char: string): number {
  return char.charCodeAt(0);
}

test("Gets the category of a Latin lowercase letter", t => {
  t.equal(getCategory(code("a")), Category.Ll);
});

test("Gets the category of a Latin uppercase letter", t => {
  t.equal(getCategory(code("A")), Category.Lu);
});

test("Gets the category of a Greek lowercase letter", t => {
  t.equal(getCategory(code("γ")), Category.Ll);
});

test("Gets the category of a Greek uppercase letter", t => {
  t.equal(getCategory(code("Γ")), Category.Lu);
});

test("Gets the category of a modifier letter", t => {
  t.equal(getCategory(code("ʰ")), Category.Lm);
});

test("Gets the category of a Latin digit", t => {
  t.equal(getCategory(code("5")), Category.Nd);
});

test("Gets the category of an Arabic digit", t => {
  t.equal(getCategory(code("٩")), Category.Nd);
});

test("Returns null for character codes outside the Unicode range", t => {
  t.equal(getCategory(-1), null);
  t.equal(getCategory(0x110000), null);
});
