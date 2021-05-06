import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R5, { Outcomes } from "../../src/sia-r5/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an html element with lang attribute whose value is a valid primary language subtag`, async (t) => {
    const target = <html lang="en"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R5, { document }), [
      passed(R5, target.attribute("lang").get(), {
        1: Outcomes.HasValidLanguage,
      }),
    ]);
  });

  test(`evaluate() passes an html element with lang attribute whose value is a  valid language tag even though the region subtag is not`, async (t) => {
    const target = <html lang="en-US-GB"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R5, { document }), [
      passed(R5, target.attribute("lang").get(), {
        1: Outcomes.HasValidLanguage,
      }),
    ]);
  });

  test(`evaluate() fails an html element with lang attribute whose value is not a valid language tag.`, async (t) => {
    const target = <html lang="em-US"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R5, { document }), [
      failed(R5, target.attribute("lang").get(), {
        1: Outcomes.HasNoValidLanguage,
      }),
    ]);
  });

  test(`evaluate() fails an html element with lang attribute whose value is not a valid language tag.`, async (t) => {
    const target = <html lang="#1"></html>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R5, { document }), [
      failed(R5, target.attribute("lang").get(), {
        1: Outcomes.HasNoValidLanguage,
      }),
    ]);
  });

  test(`evaluate() is inapplicable to svg elements.`, async (t) => {
    const target = <svg xmlns="http://www.w3.org/2000/svg" lang="fr"></svg>;
    const document = Document.of([target]);

    t.deepEqual(await evaluate(R5, { document }), [inapplicable(R5)]);
});