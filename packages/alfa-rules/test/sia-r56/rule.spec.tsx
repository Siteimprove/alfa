import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R56, { Outcomes } from "../../src/sia-r56/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

import { Group } from "../../src/common/group";

test("evaluate() passes when same landmarks have different names", async (t) => {
  const author = <aside aria-label="About the author" id="author" />;
  const book = <aside aria-label="About the book" id="book" />;

  const document = Document.of([author, book]);
  const target = Group.of([author, book]);

  t.deepEqual(await evaluate(R56, { document }), [
    passed(R56, target, { 1: Outcomes.differentNames("complementary") }),
  ]);
});

test("evaluate() fails when same landmarks have same names", async (t) => {
  const aside1 = <aside aria-label="More information" id="author" />;
  const aside2 = <aside aria-label="More information" id="book" />;

  const document = Document.of([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(await evaluate(R56, { document }), [
    failed(R56, target, { 1: Outcomes.sameNames("complementary", [target]) }),
  ]);
});

test("evaluate() fails when same landmarks have no names", async (t) => {
  const aside1 = <aside id="author" />;
  const aside2 = <aside id="book" />;

  const document = Document.of([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(await evaluate(R56, { document }), [
    failed(R56, target, { 1: Outcomes.sameNames("complementary", [target]) }),
  ]);
});

test("evaluate() is inapplicable when only different landmarks exist", async (t) => {
  const aside = <aside />;
  const nav = <nav />;

  const document = Document.of([aside, nav]);

  t.deepEqual(await evaluate(R56, { document }), [inapplicable(R56)]);
});
