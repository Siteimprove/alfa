import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R6, { Outcomes } from "../../dist/sia-dr6/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const html = (lang: string, xml: string) =>
  h.element("html", [h.attribute("lang", lang), h.attribute("xml:lang", xml)]);

test(`evaluate() passes an html element which has identical primary
      language subtags for its lang and xml:lang attributes`, async (t) => {
  const target = html("en", "en");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [
    passed(R6, target, {
      1: Outcomes.HasMatchingLanguages,
    }),
  ]);
});

test(`evaluate() passes an html element which has identical primary and
     extended language subtags for its lang and xml:lang attributes`, async (t) => {
  const target = html("en-GB", "en-GB");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [
    passed(R6, target, {
      1: Outcomes.HasMatchingLanguages,
    }),
  ]);
});

test(`evaluate() fails an html element which has different primary
     language subtags for its lang and xml:lang attributes`, async (t) => {
  const target = html("fr", "en");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [
    failed(R6, target, {
      1: Outcomes.HasNonMatchingLanguages,
    }),
  ]);
});

test(`evaluate() fails an html element which has different primary language
     subtags but matching extended subtags for its lang and xml:lang attributes`, async (t) => {
  const target = html("fr-CA", "en-CA");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [
    failed(R6, target, {
      1: Outcomes.HasNonMatchingLanguages,
    }),
  ]);
});

test(`evaluate() is inapplicable to svg elements`, async (t) => {
  const target = h.element("svg", [
    h.attribute("lang", "en"),
    h.attribute("xml:lang", "en"),
  ]);

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});

test(`evaluate() is inapplicable to html elements whose lang attribute is not
     a valid language tag`, async (t) => {
  const target = html("invalid", "en");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});

test(`evaluate() is inapplicable to html elements with an empty xml:lang attribute`, async (t) => {
  const target = html("fr", "");

  const document = h.document([target]);

  t.deepEqual(await evaluate(R6, { document }), [inapplicable(R6)]);
});
