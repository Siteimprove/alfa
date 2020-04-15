import { Document, Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";
import { hasId } from "../../src/common/predicate/has-id";

import R24, { Outcomes } from "../../src/sia-r24/rule";
import { evaluate } from "../common/evaluate";
import { makeOracle } from "../common/make-oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

const { isElement, hasName } = Element;
const { and, equals } = Predicate;

test("Passes when non-streaming video elements have all audio and visual information available in a transcript", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div>
        <video controls>
          <source src="foo.mp4" type="video/mp4" />
          <source src="foo.webm" type="video/webm" />
        </video>
        <span id="transcript">Transcript</span>
      </div>,
      Option.of(self)
    ),
  ]);

  const video = document
    .descendants()
    .filter(and(isElement, hasName("video")))
    .first()
    .get();
  const transcript = document
    .descendants()
    .filter(and(isElement, hasId(equals("transcript"))))
    .first()
    .get();

  const oracle = makeOracle({
    "is-streaming": false,
    "has-audio": true,
    transcript: Option.of(transcript),
  });

  t.deepEqual(await evaluate(R24, { document }, oracle), [
    passed(R24, video, { 1: Outcomes.HasTranscript }),
  ]);
});

test("Fails when non-streaming video elements have no audio and visual information available in a transcript", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <video controls>
        <source src="foo.mp4" type="video/mp4" />
        <source src="foo.webm" type="video/webm" />
      </video>,
      Option.of(self)
    ),
  ]);

  const video = document
    .descendants()
    .filter(and(Element.isElement, hasName("video")))
    .first()
    .get();

  const oracle = makeOracle({
    "is-streaming": false,
    "has-audio": true,
    transcript: None,
    "transcript-link": None,
  });

  t.deepEqual(await evaluate(R24, { document }, oracle), [
    failed(R24, video, { 1: Outcomes.HasNoTranscript }),
  ]);
});

test("Can't tell when some questions are left unanswered", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <video controls>
        <source src="foo.mp4" type="video/mp4" />
        <source src="foo.webm" type="video/webm" />
      </video>,
      Option.of(self)
    ),
  ]);

  const video = document
    .descendants()
    .filter(and(Element.isElement, hasName("video")))
    .first()
    .get();

  const oracle = makeOracle({
    "is-streaming": false,
    "has-audio": true,
    transcript: None,
  });

  t.deepEqual(await evaluate(R24, { document }, oracle), [
    cantTell(R24, video),
  ]);
});

test("Is inapplicable when element is not a video element", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<img src="foo.mp4" />, Option.of(self)),
  ]);

  const img = document
    .descendants()
    .filter(and(Element.isElement, hasName("img")))
    .first()
    .get();

  t.deepEqual(await evaluate(R24, { document }), [inapplicable(R24)]);
});

test("Is inapplicable when applicability questions are unanswered", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <video controls>
        <source src="foo.mp4" type="video/mp4" />
        <source src="foo.webm" type="video/webm" />
      </video>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R24, { document }), [inapplicable(R24)]);
});
