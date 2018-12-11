import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R23 } from "../../src/sia-r23/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R23 passes when non-streaming audio elements has a text alternative or captions for all included auditory information", t => {
  const audio = (
    <audio src="../test-assets/moon-audio/moon-speech.mp3" controls />
  );
  const document = documentFromNodes([
    <div>
      {audio}
      <a href="/test-assets/moon-audio/moon-speech-transcript.html">
        Transcript
      </a>
    </div>
  ]);

  const answers = [
    {
      rule: SIA_R23,
      expectation: 1,
      aspect: document,
      target: audio,
      answer: true
    }
  ];

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { passed: [audio] },
    answers
  );
});

test("SIA-R23 fails when non-streaming audio elements has no text alternative or captions for all included auditory information", t => {
  const audio = (
    <audio
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );
  const document = documentFromNodes([audio]);

  const answers = [
    {
      rule: SIA_R23,
      expectation: 1,
      aspect: document,
      target: audio,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { failed: [audio] },
    answers
  );
});

test("SIA-R23 is inapplicable when element is not a audio element", t => {
  const img = (
    <img src="../test-assets/perspective-video/perspective-video-with-captions.mp4" />
  );
  const document = documentFromNodes([img]);

  const answers = [
    {
      rule: SIA_R23,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    answers
  );
});

test("SIA-R23 can't tell when no answers are passed", t => {
  const audio = (
    <audio
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );
  const document = documentFromNodes([audio]);

  outcome(
    t,
    SIA_R23,
    { document, device: getDefaultDevice() },
    { cantTell: [audio] },
    []
  );
});
