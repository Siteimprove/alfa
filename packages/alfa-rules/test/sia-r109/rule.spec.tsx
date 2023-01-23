import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Language } from "@siteimprove/alfa-iana";

import R109, { Outcomes } from "../../src/sia-r109/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

const english = Language.parse("en").get();
const french = Language.parse("fr").get();
const british = Language.parse("en-gb").get();
const american = Language.parse("en-us").get();

test("evaluate() passes documents whose lang attribute matches the main language", async (t) => {
  const document = h.document([
    <html lang="en">
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(R109, { document }, oracle({ "document-language": "en" })),
    [
      passed(
        R109,
        document,
        {
          1: Outcomes.HasCorrectLang(english, english),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() passes documents whose lang primary attribute matches the main language", async (t) => {
  const document = h.document([
    <html lang="en-gb">
      <div>Some text in British, isn't it?</div>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R109,
      { document },
      oracle({ "document-language": "en-us" })
    ),
    [
      passed(
        R109,
        document,
        {
          1: Outcomes.HasCorrectLang(british, american),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() fails documents whose lang attribute does not match the main language", async (t) => {
  const document = h.document([
    <html lang="fr">
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(R109, { document }, oracle({ "document-language": "en" })),
    [
      failed(
        R109,
        document,
        { 1: Outcomes.HasIncorrectLang(french, english) },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() fails documents without main language", async (t) => {
  const document = h.document([
    <html lang="en">
      <div>euisr.e senui seriunaelun</div>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R109,
      { document },
      oracle({ "document-language": "gibberish" })
    ),
    [
      failed(
        R109,
        document,
        { 1: Outcomes.HasNoLanguage(english) },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() can't tell if questions are left unanswered", async (t) => {
  const document = h.document([
    <html lang="en">
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R109, { document }), [cantTell(R109, document)]);
});

test("evaluate() is inapplicable to documents without lang attribute", async (t) => {
  const document = h.document([
    <html>
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R109, { document }), [inapplicable(R109)]);
});
