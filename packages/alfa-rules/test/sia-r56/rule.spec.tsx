import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R56, { Outcomes } from "../../src/sia-r56/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

import { Group } from "../../src/common/act/group";

test("evaluate() passes when same landmarks have different names", async (t) => {
  const author = <aside aria-label="About the author" id="author" />;
  const book = <aside aria-label="About the book" id="book" />;

  const document = h.document([author, book]);
  const target = Group.of([author, book]);

  t.deepEqual(await evaluate(R56, { document }), [
    passed(R56, target, { 1: Outcomes.differentNames("complementary") }),
  ]);
});

test("evaluate() fails when same landmarks have same names", async (t) => {
  const aside1 = <aside aria-label="More information" id="author" />;
  const aside2 = <aside aria-label="More information" id="book" />;

  const document = h.document([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(await evaluate(R56, { document }), [
    failed(R56, target, { 1: Outcomes.sameNames("complementary", [target]) }),
  ]);
});

test("evaluate() fails when same forms have same names", async (t) => {
  const form1 = <form aria-label="More information" />;
  const form2 = <form aria-label="More information" />;

  const document = h.document([form1, form2]);
  const target = Group.of([form1, form2]);

  t.deepEqual(await evaluate(R56, { document }), [
    failed(R56, target, { 1: Outcomes.sameNames("form", [target]) }),
  ]);
});

test("evaluate() fails when same landmarks have no names", async (t) => {
  const aside1 = <aside role="complementary" id="author" />;
  const aside2 = <aside role="complementary" id="book" />;

  const document = h.document([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(await evaluate(R56, { document }), [
    failed(R56, target, { 1: Outcomes.sameNames("complementary", [target]) }),
  ]);
});

test("evaluate() is inapplicable when only different landmarks exist", async (t) => {
  const main = <main />;
  const nav = <nav />;

  const document = h.document([main, nav]);

  t.deepEqual(await evaluate(R56, { document }), [inapplicable(R56)]);
});

test("evaluate() is inapplicable to form without accessible name and role", async (t) => {
  const form1 = <form />;
  const form2 = <form />;

  const document = h.document([form1, form2]);

  t.deepEqual(await evaluate(R56, { document }), [inapplicable(R56)]);
});
