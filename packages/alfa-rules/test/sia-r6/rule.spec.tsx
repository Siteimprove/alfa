import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R6, { Outcomes } from "../../src/sia-r6/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an html element which has identical primary language subtags for its lang and xml:lang attributes.", async (t) => {
    const target = <html lang="en" xml:lang="en"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R6, { document }), [
      passed(R6, target, {
        1: Outcomes.HasMatchingLanguages,
      }),
    ]);
  });

  test("evaluate() passes an html element which has identical primary language subtags for its lang and xml:lang attributes. The extended language subtags also match.", async (t) => {
    const target = <html lang="en-GB" xml:lang="en-GB"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R6, { document }), [
      passed(R6, target, {
        1: Outcomes.HasMatchingLanguages,
      }),
    ]);
  });

  test("evaluate() fails an html element which has different primary language subtags for its lang and xml:lang attributes.", async (t) => {
    const target = <html lang="fr" xml:lang="en"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R6, { document }), [
      failed(R6, target, {
        1: Outcomes.HasNonMatchingLanguages,
      }),
    ]);
  });

  test("evaluate() fails an html element which has different primary language subtags for its lang and xml:lang attributes.  The extended language subtags do match", async (t) => {
    const target = <html lang="fr-CA" xml:lang="en-CA"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R6, { document }), [
      failed(R6, target, {
        1: Outcomes.HasNonMatchingLanguages,
      }),
    ]);
  });

  test(`evaluate() is inapplicable to svg elements.`, async (t) => {
        const target = <svg xmlns="http://www.w3.org/2000/svg" lang="en" xml:lang="en"></svg>;
  
        const document = Document.of([target]);

  t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});

test(`evaluate() is inapplicable to html elements whose lang attribute is not a valid language tag.`, async (t) => {
    const target = <html lang="em" xml:lang="en"></html>;

    const document = Document.of([target]);

t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});

test(`evaluate() is inapplicable to html elements with an empty ("") xml:lang attribute..`, async (t) => {
    const target = <html lang="fr" xml:lang=""></html>;

    const document = Document.of([target]);

t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});