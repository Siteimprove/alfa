import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R118, { Outcomes } from "../../src/sia-r118/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { oracle } from "../common/oracle.ts";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.ts";

test(`evaluate() passes an image whose text does not express anything in a
      human language`, async (t) => {
  const target = <img alt="Increase font size" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({ "is-image-text-human-language": false }),
    ),
    [
      passed(
        R118,
        target,
        { 1: Outcomes.HasNoHumanLanguageText },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() passes an image with text that is purely decorative", async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({
        "is-image-text-human-language": true,
        "is-image-text-decorative": true,
      }),
    ),
    [passed(R118, target, { 1: Outcomes.IsDecorative }, Outcome.Mode.SemiAuto)],
  );
});

test("evaluate() passes an image whose text is an insignificant part", async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({
        "is-image-text-human-language": true,
        "is-image-text-decorative": false,
        "is-image-text-incidental": true,
      }),
    ),
    [passed(R118, target, { 1: Outcomes.IsIncidental }, Outcome.Mode.SemiAuto)],
  );
});

test("evaluate() passes an image whose text presentation is essential", async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({
        "is-image-text-human-language": true,
        "is-image-text-decorative": false,
        "is-image-text-incidental": false,
        "is-image-text-essential": true,
      }),
    ),
    [passed(R118, target, { 1: Outcomes.IsEssential }, Outcome.Mode.SemiAuto)],
  );
});

test("evaluate() passes an image whose text is redundant", async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({
        "is-image-text-human-language": true,
        "is-image-text-decorative": false,
        "is-image-text-incidental": false,
        "is-image-text-essential": false,
        "is-image-text-redundant": true,
      }),
    ),
    [passed(R118, target, { 1: Outcomes.IsRedundant }, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() fails an image of text when none of the exceptions apply`, async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R118,
      { document },
      oracle({
        "is-image-text-human-language": true,
        "is-image-text-decorative": false,
        "is-image-text-incidental": false,
        "is-image-text-essential": false,
        "is-image-text-redundant": false,
      }),
    ),
    [
      failed(
        R118,
        target,
        { 1: Outcomes.IsImageOfText },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell when the questions are left unanswered", async (t) => {
  const target = <img alt="foo" src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R118, { document }), [cantTell(R118, target)]);
});

test("evaluate() is inapplicable to an element with a presentational role", async (t) => {
  const document = h.document([<img role="none" src="foo.jpg" />]);

  t.deepEqual(await evaluate(R118, { document }), [inapplicable(R118)]);
});

test("evaluate() is inapplicable to a document without images", async (t) => {
  const document = h.document([]);

  t.deepEqual(await evaluate(R118, { document }), [inapplicable(R118)]);
});
