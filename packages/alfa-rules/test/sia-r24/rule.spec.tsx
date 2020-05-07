import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R24, { Outcomes } from "../../src/sia-r24/rule";

import { hasId } from "../../src/common/predicate/has-id";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

const { isElement, hasName } = Element;
const { and, equals } = Predicate;

test("evaluate() passes when non-streaming video elements have all audio and visual information available in a transcript", async (t) => {
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
    .find(and(isElement, hasName("video")))
    .get();

  const transcript = document
    .descendants()
    .find(and(isElement, hasId(equals("transcript"))))
    .get();

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: Option.of(transcript),
      })
    ),
    [passed(R24, video, { 1: Outcomes.HasTranscript })]
  );
});

test("evaluate() fails when non-streaming video elements have no audio and visual information available in a transcript", async (t) => {
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
    .find(and(Element.isElement, hasName("video")))
    .get();

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: None,
        "transcript-link": None,
      })
    ),
    [failed(R24, video, { 1: Outcomes.HasNoTranscript })]
  );
});

test("evaluate() can't tell when some questions are left unanswered", async (t) => {
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
    .find(and(Element.isElement, hasName("video")))
    .get();

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: None,
      })
    ),
    [cantTell(R24, video)]
  );
});

test("evaluate() is inapplicable when element is not a video element", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<img src="foo.mp4" />, Option.of(self)),
  ]);

  t.deepEqual(await evaluate(R24, { document }), [inapplicable(R24)]);
});

test("evaluate() is inapplicable when applicability questions are unanswered", async (t) => {
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
