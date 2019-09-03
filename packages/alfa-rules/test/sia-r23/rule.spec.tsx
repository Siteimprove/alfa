import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R23 } from "../../src/sia-r23/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when non-streaming audio elements has a text alternative or captions for all included auditory information", t => {
  const audio = (
    <audio src="../test-assets/moon-audio/moon-speech.mp3" controls />
  );

  const document = documentFromNodes([
    <div>
      {audio}
      <a href="page.html">Transcript</a>
    </div>
  ]);

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { passed: [audio] },
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: audio,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "is-playing",
        aspect: document,
        target: audio,
        answer: true
      },
      {
        rule: SIA_R23,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: audio,
        answer: true
      }
    ]
  );
});

test("Fails when non-streaming audio elements has no text alternative or captions for all included auditory information", t => {
  const audio = <audio src="foo.mp4" controls />;

  const document = documentFromNodes([audio]);

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { failed: [audio] },
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: audio,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "is-playing",
        aspect: document,
        target: audio,
        answer: true
      },
      {
        rule: SIA_R23,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: audio,
        answer: false
      }
    ]
  );
});

test("Is inapplicable when element is not a audio element", t => {
  const img = <img src="foo.mp4" />;

  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        rule: SIA_R23,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: img,
        answer: false
      }
    ]
  );
});

test("Cannot tell when no answers are passed", t => {
  const audio = <audio src="foo.mp4" controls />;

  const document = documentFromNodes([audio]);

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { cantTell: [audio] }
  );
});
